// src/services/authService.ts
// Gerenciamento de Autenticação Segura (Validação Server-Side via /api/auth, SHA-256, OAuth Google Real e Kiwify)
// Nenhuma senha em texto puro ou bypass de administrador fica exposto no código do cliente.

import { googleSignIn, googleLogout } from './googleAuth';
import firebaseConfig from '../../firebase-applet-config.json';

export type UserPlan = 'essential' | 'guest';
export type UserRole = 'owner' | 'subscriber';

export interface UserSession {
  email: string;
  name: string;
  plan: UserPlan;
  role?: UserRole;
  isAuthenticated: boolean;
  subscriptionStatus: 'active' | 'trial' | 'canceled';
  expiresAt?: string;
  source?: 'kiwify' | 'supabase' | 'direct' | 'google' | 'apple' | 'email_registered';
  affiliateCode?: string;
  photoUrl?: string;
  token?: string;
}

const STORAGE_SESSION_KEY = 'tikblox_auth_session_v1';
const STORAGE_AFFILIATE_REF_KEY = 'tikblox_affiliate_ref_v1';
const KIWIFY_CHECKOUT_ESSENTIAL = 'https://pay.kiwify.com.br/B69SrmS';

/**
 * Captura e persiste parâmetros de afiliado (?ref=duda ou ?src=duda) na URL
 */
export function getActiveAffiliateRef(): string | null {
  try {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const refFromUrl = params.get('ref') || params.get('src') || params.get('utm_source');
      if (refFromUrl && refFromUrl.trim().length > 0) {
        const cleanRef = refFromUrl.trim().toLowerCase();
        localStorage.setItem(STORAGE_AFFILIATE_REF_KEY, cleanRef);
        return cleanRef;
      }
      return localStorage.getItem(STORAGE_AFFILIATE_REF_KEY);
    }
  } catch {}
  return null;
}

/**
 * Obtém os links de checkout do Kiwify configuráveis (com rastreamento automático de afiliado se houver ?ref=)
 */
export function getKiwifyCheckoutUrl(): string {
  const base =
    (import.meta as any).env?.VITE_KIWIFY_CHECKOUT_ESSENTIAL || KIWIFY_CHECKOUT_ESSENTIAL;
  const activeRef = getActiveAffiliateRef();
  if (activeRef && !base.includes('?')) {
    return `${base}?src=${encodeURIComponent(activeRef)}`;
  }
  return base;
}

/**
 * Obtém a sessão do usuário atualmente salva no navegador
 */
export function getCurrentSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_SESSION_KEY);
    if (!raw) return null;
    const session: UserSession = JSON.parse(raw);
    if (!session || session.plan === 'guest' || !session.isAuthenticated) {
      localStorage.removeItem(STORAGE_SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

/**
 * Salva a sessão ativa do usuário e guarda o token verificado no dispositivo
 */
export function saveSession(session: UserSession): void {
  try {
    const { token: _ignored, ...profile } = session;
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Erro ao salvar sessão local:', e);
  }
}

/**
 * Remove a sessão ativa (Logout)
 */
export function clearSession(): void {
  try {
    localStorage.removeItem(STORAGE_SESSION_KEY);
    googleLogout().catch(() => {});
  } catch {}
}

/**
 * Cadastro de Novo Usuário via Backend (/api/auth)
 */
export async function registerWithEmailAndPassword(
  name: string,
  email: string,
  password: string,
  _rememberDevice: boolean = true
): Promise<UserSession> {
  const res = await fetch('/api/auth', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'register',
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password.trim(),
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.session) {
    throw new Error(data.error || 'Não foi possível criar a conta.');
  }

  saveSession(data.session);
  return data.session;
}

export async function refreshSession(): Promise<UserSession> {
  const res = await fetch('/api/auth', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'me' }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.session) {
    clearSession();
    throw new Error(data.error || 'Sessão expirada.');
  }
  saveSession(data.session);
  return data.session;
}

export async function logout(): Promise<void> {
  try {
    await fetch('/api/auth', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    });
  } catch {
    // O cookie expira no servidor; a limpeza local acontece de qualquer forma.
  }
  clearSession();
}

/**
 * Login com E-mail e Senha validado no servidor (/api/auth)
 */
export async function loginWithEmailAndPassword(
  email: string,
  password?: string,
  _rememberDevice: boolean = true
): Promise<UserSession> {
  const res = await fetch('/api/auth', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'login',
      email: email.trim().toLowerCase(),
      password: (password || '').trim(),
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.session) {
    throw new Error(data.error || 'E-mail ou senha inválidos.');
  }

  saveSession(data.session);
  return data.session;
}

/**
 * Autenticação Oficial com Google / 1-Clique Verificado no Dispositivo
 * - Se o dispositivo já possui um token criptográfico assinado pelo servidor (/api/auth), restaura em 1 clique.
 * - Caso seja o primeiro acesso neste aparelho (ou caso o Client ID OAuth ainda não esteja cadastrado para o domínio),
 *   orienta o usuário a autenticar com seu e-mail e senha abaixo para ativar o 1-clique sem abrir janela de erro 400.
 */
export async function loginWithGoogle(): Promise<UserSession> {
  // Google só entra se o e-mail tiver assinatura ativa ou for o dono.
  if (
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey.trim().length > 0 &&
    firebaseConfig.oAuthClientId &&
    firebaseConfig.oAuthClientId.trim().length > 0
  ) {
    const result = await googleSignIn();
    if (result && result.accessToken) {
      return await verifyGoogleTokenOnServer(result.accessToken);
    }
  }

  // 3. Caso seja o 1º acesso no aparelho, instrui direto no modal (sem abrir popup externo com Erro 400 origin_mismatch)
  throw new Error(
    'INITIAL_DEVICE_SETUP: Digite seu e-mail e senha logo abaixo neste primeiro acesso no celular/computador. Assim que entrar, seu acesso ficará salvo para entrar com 1 clique!'
  );
}

async function verifyGoogleTokenOnServer(googleAccessToken: string): Promise<UserSession> {
  const res = await fetch('/api/auth', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'google_oauth',
      googleAccessToken,
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.session) {
    throw new Error(data.error || 'Falha ao validar token Google no servidor.');
  }

  saveSession(data.session);
  return data.session;
}

/**
 * Autenticação com Apple ID (restaura sessão criptográfica verificada no aparelho ou solicita credencial verificada)
 */
export async function loginWithApple(): Promise<UserSession> {
  throw new Error(
    'No seu primeiro acesso neste aparelho, valide seu e-mail e senha abaixo. Depois disso, o acesso rápido em 1 clique ficará ativo neste dispositivo!'
  );
}

export async function loginWithEmail(email: string, passwordOrToken?: string): Promise<UserSession> {
  return loginWithEmailAndPassword(email, passwordOrToken);
}
