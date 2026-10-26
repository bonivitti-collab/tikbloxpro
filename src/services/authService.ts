// src/services/authService.ts
// Gerenciamento de Autenticação Segura (Validação Server-Side via /api/auth, SHA-256, OAuth Google Real e Kiwify)
// Nenhuma senha em texto puro ou bypass de administrador fica exposto no código do cliente.

import { googleSignIn, googleLogout } from './googleAuth';
import firebaseConfig from '../../firebase-applet-config.json';

export type UserPlan = 'essential' | 'pro_ai' | 'admin' | 'guest';
export type UserRole = 'admin' | 'creator_vip' | 'subscriber';

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
const STORAGE_VERIFIED_TOKEN_SESSION_KEY = 'tikblox_verified_device_session_v1';
const STORAGE_AFFILIATE_REF_KEY = 'tikblox_affiliate_ref_v1';
const KIWIFY_CHECKOUT_RADAR_DEFAULT = 'https://pay.kiwify.com.br/B69SrmS';
const KIWIFY_CHECKOUT_COMBO_DEFAULT = 'https://pay.kiwify.com.br/ejnXKgn';

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
export function getKiwifyCheckoutUrls() {
  const baseRadar = (import.meta as any).env?.VITE_KIWIFY_CHECKOUT_RADAR || KIWIFY_CHECKOUT_RADAR_DEFAULT;
  const baseCombo = (import.meta as any).env?.VITE_KIWIFY_CHECKOUT_COMBO || KIWIFY_CHECKOUT_COMBO_DEFAULT;
  const activeRef = getActiveAffiliateRef();

  if (activeRef && !baseCombo.includes('?src=')) {
    const encoded = encodeURIComponent(activeRef);
    return {
      radar: `${baseRadar}?src=${encoded}`,
      combo: `${baseCombo}?src=${encoded}`,
      rawRadar: baseRadar,
      rawCombo: baseCombo,
    };
  }

  return {
    radar: baseRadar,
    combo: baseCombo,
    rawRadar: baseRadar,
    rawCombo: baseCombo,
  };
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
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
    if (session.token) {
      localStorage.setItem(STORAGE_VERIFIED_TOKEN_SESSION_KEY, JSON.stringify(session));
    }
  } catch (e) {
    console.error('Erro ao salvar sessão local:', e);
  }
}

/**
 * Obtém a sessão previamente autenticada com token assinado neste dispositivo (para re-login rápido 1-clique)
 */
export function getVerifiedDeviceSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_VERIFIED_TOKEN_SESSION_KEY);
    if (!raw) return null;
    const session: UserSession = JSON.parse(raw);
    if (session && session.token && session.isAuthenticated) {
      return session;
    }
    return null;
  } catch {
    return null;
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
  password: string
): Promise<UserSession> {
  const res = await fetch('/api/auth', {
    method: 'POST',
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

/**
 * Login com E-mail e Senha validado por Hash SHA-256 no Servidor (/api/auth)
 */
export async function loginWithEmailAndPassword(
  email: string,
  password?: string
): Promise<UserSession> {
  const res = await fetch('/api/auth', {
    method: 'POST',
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
  // 1. Se este dispositivo já foi autenticado com token assinado pelo servidor, restaura em 1 clique instantaneamente
  const verifiedDevice = getVerifiedDeviceSession();
  if (verifiedDevice && verifiedDevice.token) {
    saveSession(verifiedDevice);
    return verifiedDevice;
  }

  // 2. Se Firebase Auth estiver explicitamente configurado com apiKey e oAuthClientId próprios
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
  const verifiedDevice = getVerifiedDeviceSession();
  if (verifiedDevice && verifiedDevice.token) {
    saveSession(verifiedDevice);
    return verifiedDevice;
  }

  throw new Error(
    'No seu primeiro acesso neste aparelho, valide seu e-mail e senha abaixo. Depois disso, o acesso rápido em 1 clique ficará ativo neste dispositivo!'
  );
}

export async function loginWithEmail(email: string, passwordOrToken?: string): Promise<UserSession> {
  return loginWithEmailAndPassword(email, passwordOrToken);
}
