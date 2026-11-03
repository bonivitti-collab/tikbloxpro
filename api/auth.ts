// api/auth.ts - Servidor de Autenticação Segura, Criptografia SHA-256, Validação OAuth Google e Controle de Assinantes Kiwify
import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';

const SALT = 'tikblox_salt_v1:';
const JWT_SECRET = process.env.TIKBLOX_AUTH_SECRET || 'tikblox_sentinel_enterprise_secret_2026_v1';
const SUBSCRIBERS_FILE = path.join(os.tmpdir(), 'tikblox_kiwify_subscribers.json');
const MEMORY_STORE: Record<string, SubscriberRecord> = {};

// Hashes SHA-256 (senhas NUNCA ficam em texto puro no código)
const PROTECTED_ACCOUNTS: Record<
  string,
  {
    passwordHash: string;
    name: string;
    plan: 'admin' | 'pro_ai' | 'essential';
    role: 'admin' | 'creator_vip' | 'subscriber';
    affiliateCode?: string;
  }
> = {
  'dbonivitti@gmail.com': {
    passwordHash: 'cfa225309d259dab977bbc8938a72ed136be53d053e970df527843c10dcccb53',
    name: 'Danillo Bonivitti',
    plan: 'pro_ai',
    role: 'subscriber',
  },
  'contato.dudavitti@gmail.com': {
    passwordHash: 'af999e05f41cd9e701bb4016a6fc87fe451ec15ba2d771db88bba55ab1053487',
    name: 'Duda Vitti (Creator VIP)',
    plan: 'pro_ai',
    role: 'creator_vip',
    affiliateCode: 'duda',
  },
  'dudavitti@gmail.com': {
    passwordHash: 'af999e05f41cd9e701bb4016a6fc87fe451ec15ba2d771db88bba55ab1053487',
    name: 'Duda Vitti (Creator VIP)',
    plan: 'pro_ai',
    role: 'creator_vip',
    affiliateCode: 'duda',
  },
};

export interface SubscriberRecord {
  email: string;
  name: string;
  plan: 'pro_ai' | 'essential';
  status: 'active' | 'revoked';
  passwordHash?: string;
  updatedAt: string;
}

export function hashPassword(password: string): string {
  return crypto
    .createHash('sha256')
    .update(SALT + password.trim())
    .digest('hex');
}

export function signSessionToken(payload: object): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}

export function loadSubscribersStore(): Record<string, SubscriberRecord> {
  try {
    if (fs.existsSync(SUBSCRIBERS_FILE)) {
      const raw = fs.readFileSync(SUBSCRIBERS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      Object.assign(MEMORY_STORE, parsed);
    }
  } catch {}
  return MEMORY_STORE;
}

export function saveSubscribersStore(store: Record<string, SubscriberRecord>): void {
  Object.assign(MEMORY_STORE, store);
  try {
    fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(MEMORY_STORE, null, 2), 'utf-8');
  } catch (e) {
    console.warn('[AUTH STORE] Aviso ao gravar cache local:', e);
  }
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, email, password, name, googleAccessToken } = req.body || {};
    const cleanEmail = (email || '').trim().toLowerCase();
    const store = loadSubscribersStore();

    // =========================================================================
    // 1. AUTENTICAÇÃO OFICIAL VIA TOKEN OAUTH DO GOOGLE (VERIFICADO NO GOOGLE)
    // =========================================================================
    if (action === 'google_oauth') {
      if (!googleAccessToken) {
        return res.status(400).json({ error: 'Token OAuth do Google ausente.' });
      }

      const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${googleAccessToken}` },
      });

      if (!googleRes.ok) {
        return res.status(401).json({ error: 'Token do Google inválido ou expirado. Tente novamente.' });
      }

      const googleUser = await googleRes.json();
      const verifiedEmail = (googleUser.email || '').trim().toLowerCase();

      if (!verifiedEmail) {
        return res.status(400).json({ error: 'A conta Google não retornou um e-mail válido.' });
      }

      // Verifica se é conta protegida (Danillo Admin ou Duda VIP)
      const protectedAcc = PROTECTED_ACCOUNTS[verifiedEmail];
      if (protectedAcc) {
        const session = {
          email: verifiedEmail,
          name: googleUser.name || protectedAcc.name,
          plan: protectedAcc.plan,
          role: protectedAcc.role,
          affiliateCode: protectedAcc.affiliateCode,
          isAuthenticated: true,
          subscriptionStatus: 'active',
          source: 'google',
          photoUrl: googleUser.picture,
          token: signSessionToken({ email: verifiedEmail, role: protectedAcc.role, iat: Date.now() }),
        };
        return res.status(200).json({ session });
      }

      // Verifica se o assinante teve reembolso/cancelamento na Kiwify
      const subRecord = store[verifiedEmail];
      if (subRecord && subRecord.status === 'revoked') {
        return res.status(403).json({
          error: 'Sua assinatura consta como cancelada ou reembolsada na Kiwify.',
        });
      }

      const assignedPlan = subRecord?.plan || 'pro_ai';
      const session = {
        email: verifiedEmail,
        name: googleUser.name || subRecord?.name || verifiedEmail.split('@')[0].toUpperCase(),
        plan: assignedPlan,
        role: 'subscriber',
        isAuthenticated: true,
        subscriptionStatus: 'active',
        source: 'google',
        photoUrl: googleUser.picture,
        token: signSessionToken({ email: verifiedEmail, role: 'subscriber', iat: Date.now() }),
      };
      return res.status(200).json({ session });
    }

    // =========================================================================
    // 2. LOGIN COM E-MAIL E SENHA (VALIDADO POR HASH SHA-256 NO SERVIDOR)
    // =========================================================================
    if (action === 'login') {
      if (!cleanEmail || !cleanEmail.includes('@')) {
        return res.status(400).json({ error: 'Informe um e-mail válido.' });
      }
      if (!password || password.trim().length < 4) {
        return res.status(400).json({ error: 'Por favor, digite sua senha de acesso.' });
      }

      const inputHash = hashPassword(password);

      // 2.1 Conta Protegida (Danillo Admin ou Duda VIP) -> NUNCA entra sem a senha exata!
      const protectedAcc = PROTECTED_ACCOUNTS[cleanEmail];
      if (protectedAcc) {
        if (inputHash !== protectedAcc.passwordHash) {
          return res.status(401).json({
            error: 'Senha incorreta para esta conta protegida.',
          });
        }

        const session = {
          email: cleanEmail,
          name: protectedAcc.name,
          plan: protectedAcc.plan,
          role: protectedAcc.role,
          affiliateCode: protectedAcc.affiliateCode,
          isAuthenticated: true,
          subscriptionStatus: 'active',
          source: 'direct',
          token: signSessionToken({ email: cleanEmail, role: protectedAcc.role, iat: Date.now() }),
        };
        return res.status(200).json({ session });
      }

      // 2.2 Verifica se foi cancelado/reembolsado na Kiwify
      const subRecord = store[cleanEmail];
      if (subRecord && subRecord.status === 'revoked') {
        return res.status(403).json({
          error: 'Acesso bloqueado: assinatura reembolsada ou cancelada na Kiwify.',
        });
      }

      // 2.3 Se o assinante já tem senha cadastrada no servidor, valida o hash
      if (subRecord && subRecord.passwordHash && subRecord.passwordHash !== inputHash) {
        return res.status(401).json({ error: 'Senha incorreta para o e-mail informado.' });
      }

      // Salva o hash da senha no primeiro acesso do assinante Kiwify
      if (subRecord && !subRecord.passwordHash) {
        subRecord.passwordHash = inputHash;
        saveSubscribersStore(store);
      }

      const session = {
        email: cleanEmail,
        name: subRecord?.name || cleanEmail.split('@')[0].toUpperCase(),
        plan: subRecord?.plan || 'pro_ai',
        role: 'subscriber',
        isAuthenticated: true,
        subscriptionStatus: 'active',
        source: 'kiwify',
        token: signSessionToken({ email: cleanEmail, role: 'subscriber', iat: Date.now() }),
      };

      return res.status(200).json({ session });
    }

    // =========================================================================
    // 3. CADASTRO DE CONTA DO ASSINANTE ("CRIAR CONTA NOVA")
    // =========================================================================
    if (action === 'register') {
      if (!name || name.trim().length < 2) {
        return res.status(400).json({ error: 'Informe seu nome completo.' });
      }
      if (!cleanEmail || !cleanEmail.includes('@')) {
        return res.status(400).json({ error: 'Informe um e-mail válido.' });
      }
      if (!password || password.trim().length < 6) {
        return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres.' });
      }

      // Impede que qualquer pessoa tente registrar o e-mail do Admin ou da Duda
      if (PROTECTED_ACCOUNTS[cleanEmail]) {
        return res.status(403).json({
          error: 'Este e-mail pertence à administração oficial. Use a aba "Já tenho conta" com sua senha.',
        });
      }

      const existing = store[cleanEmail];
      if (existing && existing.status === 'revoked') {
        return res.status(403).json({
          error: 'Esta assinatura consta como cancelada ou reembolsada na Kiwify.',
        });
      }

      const inputHash = hashPassword(password);
      store[cleanEmail] = {
        email: cleanEmail,
        name: name.trim(),
        plan: existing?.plan || 'pro_ai',
        status: 'active',
        passwordHash: inputHash,
        updatedAt: new Date().toISOString(),
      };
      saveSubscribersStore(store);

      const session = {
        email: cleanEmail,
        name: name.trim(),
        plan: store[cleanEmail].plan,
        role: 'subscriber',
        isAuthenticated: true,
        subscriptionStatus: 'active',
        source: 'email_registered',
        token: signSessionToken({ email: cleanEmail, role: 'subscriber', iat: Date.now() }),
      };

      return res.status(200).json({ session });
    }

    return res.status(400).json({ error: 'Ação de autenticação inválida.' });
  } catch (err: any) {
    console.error('[AUTH API ERROR]:', err);
    return res.status(500).json({ error: 'Erro interno no servidor de autenticação.' });
  }
}
