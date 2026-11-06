import {
  cleanName,
  cleanPassword,
  clientIp,
  normalizeEmail,
  readCookie,
  sendJson,
} from '../lib/http.js';
import { accessDeniedMessage, subscriberCanAccess } from '../lib/accessPolicy.js';
import { claimCodesMatch } from '../lib/claim.js';
import { isOwnerEmail, ownerName, ownerPasswordMatches } from '../lib/owner.js';
import { hashPassword, verifyPassword } from '../lib/passwords.js';
import { isRateLimited } from '../lib/rateLimit.js';
import {
  SESSION_COOKIE_NAME,
  clearSessionCookie,
  sessionCookie,
  signSession,
  verifySession,
} from '../lib/session.js';
import { getSubscriber, saveSubscriber, subscriberBackend } from '../lib/subscribers.js';

const LOGIN_WINDOW_MS = 15 * 60 * 1000;

function publicSession(email: string, name: string, role: 'owner' | 'subscriber') {
  return {
    email,
    name,
    plan: 'essential' as const,
    role,
    isAuthenticated: true,
    subscriptionStatus: 'active' as const,
    source: role === 'owner' ? 'direct' : 'kiwify',
  };
}

async function issueSession(req: any, res: any, email: string, name: string, role: 'owner' | 'subscriber') {
  const token = signSession({ email, role });
  sendJson(res, 200, { session: publicSession(email, name, role) }, {
    'Set-Cookie': sessionCookie(token, req),
  });
}

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const action = typeof body.action === 'string' ? body.action : '';
    const ip = clientIp(req);

    if (action === 'logout') {
      return sendJson(res, 200, { ok: true }, { 'Set-Cookie': clearSessionCookie(req) });
    }

    if (action === 'me') {
      const claims = verifySession(readCookie(req, SESSION_COOKIE_NAME));
      if (!claims) {
        return sendJson(res, 401, { error: 'Sessão expirada. Entre novamente.' }, {
          'Set-Cookie': clearSessionCookie(req),
        });
      }
      if (claims.role === 'owner' && isOwnerEmail(claims.email)) {
        return sendJson(res, 200, {
          session: publicSession(claims.email, ownerName(), 'owner'),
        });
      }
      if (subscriberBackend() === 'unconfigured') {
        return sendJson(res, 503, { error: 'Base de assinantes ainda não configurada.' });
      }
      const subscriber = await getSubscriber(claims.email);
      if (!subscriberCanAccess(subscriber)) {
        return sendJson(res, 403, { error: accessDeniedMessage(subscriber) }, {
          'Set-Cookie': clearSessionCookie(req),
        });
      }
      return sendJson(res, 200, {
        session: publicSession(subscriber.email, subscriber.name, 'subscriber'),
      });
    }

    if (await isRateLimited(`auth:${ip}`, 30, LOGIN_WINDOW_MS)) {
      return sendJson(res, 429, { error: 'Muitas tentativas. Aguarde alguns minutos e tente de novo.' });
    }

    if (action === 'google_oauth') {
      const googleAccessToken = typeof body.googleAccessToken === 'string' ? body.googleAccessToken.trim() : '';
      if (!googleAccessToken || googleAccessToken.length > 4096) {
        return sendJson(res, 400, { error: 'Token do Google ausente.' });
      }
      const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${googleAccessToken}` },
      });
      if (!googleRes.ok) {
        return sendJson(res, 401, { error: 'Token do Google inválido ou expirado.' });
      }
      const googleUser = await googleRes.json();
      const email = normalizeEmail(googleUser.email);
      if (!email || googleUser.email_verified === false) {
        return sendJson(res, 401, { error: 'A conta Google não confirmou um e-mail válido.' });
      }
      const name = cleanName(googleUser.name) || email.split('@')[0];
      if (isOwnerEmail(email)) {
        return issueSession(req, res, email, name, 'owner');
      }
      if (subscriberBackend() === 'unconfigured') {
        return sendJson(res, 503, { error: 'Base de assinantes ainda não configurada.' });
      }
      const subscriber = await getSubscriber(email);
      if (!subscriberCanAccess(subscriber)) {
        return sendJson(res, 403, { error: accessDeniedMessage(subscriber) });
      }
      return issueSession(req, res, email, subscriber.name || name, 'subscriber');
    }

    const email = normalizeEmail(body.email);
    const password = cleanPassword(body.password, action === 'register' ? 8 : 4);

    if (action === 'login') {
      if (!email || !password) {
        return sendJson(res, 400, { error: 'Informe e-mail e senha válidos.' });
      }
      if (await isRateLimited(`login:${ip}:${email}`, 8, LOGIN_WINDOW_MS)) {
        return sendJson(res, 429, { error: 'Muitas tentativas para este e-mail. Aguarde alguns minutos.' });
      }
      if (isOwnerEmail(email)) {
        if (!ownerPasswordMatches(password)) {
          return sendJson(res, 401, { error: 'E-mail ou senha inválidos.' });
        }
        return issueSession(req, res, email, ownerName(), 'owner');
      }
      if (subscriberBackend() === 'unconfigured') {
        return sendJson(res, 503, { error: 'Base de assinantes ainda não configurada.' });
      }
      const subscriber = await getSubscriber(email);
      if (!subscriberCanAccess(subscriber)) {
        return sendJson(res, 403, { error: accessDeniedMessage(subscriber) });
      }
      if (!subscriber.password_hash) {
        return sendJson(res, 403, {
          error: 'Primeiro acesso: use o código do pedido que a Kiwify enviou no e-mail da compra.',
        });
      }
      if (!verifyPassword(password, subscriber.password_hash)) {
        return sendJson(res, 401, { error: 'E-mail ou senha inválidos.' });
      }
      return issueSession(req, res, email, subscriber.name, 'subscriber');
    }

    if (action === 'register') {
      const name = cleanName(body.name);
      const orderCode = typeof body.orderCode === 'string' ? body.orderCode.trim() : '';
      if (!name || !email || !password || orderCode.length < 4) {
        return sendJson(res, 400, {
          error: 'Informe nome, e-mail da compra, o código do pedido da Kiwify e uma senha de pelo menos 8 caracteres.',
        });
      }
      if (isOwnerEmail(email)) {
        return sendJson(res, 403, { error: 'Este e-mail entra pela aba Já tenho conta.' });
      }
      if (await isRateLimited(`claim:${ip}:${email}`, 8, LOGIN_WINDOW_MS)) {
        return sendJson(res, 429, { error: 'Muitas tentativas para este e-mail. Aguarde alguns minutos.' });
      }
      if (subscriberBackend() === 'unconfigured') {
        return sendJson(res, 503, { error: 'Base de assinantes ainda não configurada.' });
      }
      const subscriber = await getSubscriber(email);
      if (!subscriberCanAccess(subscriber) || !subscriber) {
        return sendJson(res, 403, { error: accessDeniedMessage(subscriber) });
      }
      if (subscriber.password_hash) {
        return sendJson(res, 409, { error: 'Esta conta já tem senha. Entre em Já tenho conta.' });
      }
      if (!subscriber.claim_code_hash || !claimCodesMatch(orderCode, subscriber.claim_code_hash)) {
        return sendJson(res, 401, { error: 'O código do pedido não confere com a compra deste e-mail.' });
      }
      subscriber.name = name;
      subscriber.password_hash = hashPassword(password);
      subscriber.updated_at = new Date().toISOString();
      await saveSubscriber(subscriber);
      return issueSession(req, res, email, name, 'subscriber');
    }

    return sendJson(res, 400, { error: 'Ação de autenticação inválida.' });
  } catch (error: any) {
    const code = error?.message || '';
    if (code === 'AUTH_SECRET_MISSING' || code === 'AUTH_SECRET_LEAKED' || code === 'SUBSCRIBER_STORE_UNCONFIGURED') {
      console.error('[AUTH]', code);
      return sendJson(res, 503, { error: 'Autenticação ainda não configurada no servidor.' });
    }
    console.error('[AUTH]', error);
    return sendJson(res, 500, { error: 'Erro interno no servidor de autenticação.' });
  }
}
