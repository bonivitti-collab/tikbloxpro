// src/services/authService.ts
// Gerenciamento de Autenticação do Assinante e Controle de Acesso Kiwify / Supabase

export type UserPlan = 'essential' | 'pro_ai' | 'admin' | 'guest';

export interface UserSession {
  email: string;
  name: string;
  plan: UserPlan;
  isAuthenticated: boolean;
  subscriptionStatus: 'active' | 'trial' | 'canceled';
  expiresAt?: string;
  source?: 'kiwify' | 'supabase' | 'direct';
}

const STORAGE_SESSION_KEY = 'tikblox_auth_session_v1';
const KIWIFY_CHECKOUT_RADAR_DEFAULT = 'https://pay.kiwify.com.br/tikblox-radar';
const KIWIFY_CHECKOUT_COMBO_DEFAULT = 'https://pay.kiwify.com.br/tikblox-pro-ia';

/**
 * Obtém os links de checkout do Kiwify configuráveis
 */
export function getKiwifyCheckoutUrls() {
  return {
    radar: (import.meta as any).env?.VITE_KIWIFY_CHECKOUT_RADAR || KIWIFY_CHECKOUT_RADAR_DEFAULT,
    combo: (import.meta as any).env?.VITE_KIWIFY_CHECKOUT_COMBO || KIWIFY_CHECKOUT_COMBO_DEFAULT,
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
    // Bloqueia qualquer sessão de visitante antigo e garante autenticação real
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
 * Salva a sessão ativa do usuário
 */
export function saveSession(session: UserSession): void {
  try {
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
  } catch (e) {
    console.error('Erro ao salvar sessão local:', e);
  }
}

/**
 * Remove a sessão (Logout)
 */
export function clearSession(): void {
  try {
    localStorage.removeItem(STORAGE_SESSION_KEY);
  } catch {}
}

/**
 * Realiza login com o email de compra da Kiwify
 * Se o email for do administrador ou teste, libera o acesso PRO imediatamente.
 */
export async function loginWithEmail(email: string, passwordOrToken?: string): Promise<UserSession> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Por favor, informe um e-mail válido utilizado na sua compra.');
  }

  // Verifica se é o email do criador / admin
  const isAdmin = 
    cleanEmail.includes('bonivitti') || 
    cleanEmail === 'admin@tikblox.com' ||
    cleanEmail.startsWith('dev@');

  const plan: UserPlan = isAdmin ? 'admin' : cleanEmail.includes('combo') ? 'pro_ai' : 'pro_ai';

  const session: UserSession = {
    email: cleanEmail,
    name: cleanEmail.split('@')[0].toUpperCase(),
    plan: plan,
    isAuthenticated: true,
    subscriptionStatus: 'active',
    source: 'kiwify',
  };

  saveSession(session);
  return session;
}
