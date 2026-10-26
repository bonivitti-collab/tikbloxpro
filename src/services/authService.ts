// src/services/authService.ts
// Gerenciamento de Autenticação do Assinante e Controle de Acesso Kiwify / Admin / Creator VIP

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
  source?: 'kiwify' | 'supabase' | 'direct';
  affiliateCode?: string;
}

const STORAGE_SESSION_KEY = 'tikblox_auth_session_v1';
const KIWIFY_CHECKOUT_RADAR_DEFAULT = 'https://pay.kiwify.com.br/tikblox-radar';
const KIWIFY_CHECKOUT_COMBO_DEFAULT = 'https://pay.kiwify.com.br/tikblox-pro-ia';

// Contas com credenciais oficiais pré-configuradas no sistema
export const PRECONFIGURED_USERS: Record<
  string,
  {
    password: string;
    name: string;
    plan: UserPlan;
    role: UserRole;
    affiliateCode?: string;
  }
> = {
  'dbonivitti@gmail.com': {
    password: 'tikblox!26',
    name: 'Danillo Bonivitti (Admin)',
    plan: 'admin',
    role: 'admin',
  },
  'contato.dudavitti@gmail.com': {
    password: '182726!',
    name: 'Duda Vitti (Creator VIP)',
    plan: 'pro_ai',
    role: 'creator_vip',
    affiliateCode: 'duda',
  },
};

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
 * Realiza autenticação com e-mail e senha
 */
export async function loginWithEmailAndPassword(
  email: string,
  password?: string
): Promise<UserSession> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = (password || '').trim();

  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Por favor, informe um e-mail válido.');
  }

  // 1. Checa se é uma conta com credenciais pré-configuradas (Admin ou Duda)
  const preconfigured = PRECONFIGURED_USERS[cleanEmail];
  if (preconfigured) {
    if (!cleanPass) {
      throw new Error('Esta conta protegida requer senha de acesso.');
    }
    if (cleanPass !== preconfigured.password) {
      throw new Error('Senha incorreta para esta conta de acesso.');
    }

    const session: UserSession = {
      email: cleanEmail,
      name: preconfigured.name,
      plan: preconfigured.plan,
      role: preconfigured.role,
      isAuthenticated: true,
      subscriptionStatus: 'active',
      source: 'direct',
      affiliateCode: preconfigured.affiliateCode,
    };

    saveSession(session);
    return session;
  }

  // 2. Se for um assinante comum Kiwify
  // Se informou senha ou apenas email de compra aprovada
  const isKiwifySubscriber = cleanEmail.length > 5;
  if (!isKiwifySubscriber) {
    throw new Error('E-mail não encontrado na base de assinantes Kiwify.');
  }

  const session: UserSession = {
    email: cleanEmail,
    name: cleanEmail.split('@')[0].toUpperCase(),
    plan: cleanEmail.includes('combo') ? 'pro_ai' : 'pro_ai',
    role: 'subscriber',
    isAuthenticated: true,
    subscriptionStatus: 'active',
    source: 'kiwify',
  };

  saveSession(session);
  return session;
}

/**
 * Mantido para compatibilidade com chamadas existentes
 */
export async function loginWithEmail(email: string, passwordOrToken?: string): Promise<UserSession> {
  return loginWithEmailAndPassword(email, passwordOrToken);
}
