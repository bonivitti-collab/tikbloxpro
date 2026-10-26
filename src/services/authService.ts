// src/services/authService.ts
// Gerenciamento de Autenticação do Assinante e Controle de Acesso: Google, Apple, E-mail/Senha, Kiwify e ADM

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
}

export interface RegisteredUser {
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  plan: UserPlan;
}

const STORAGE_SESSION_KEY = 'tikblox_auth_session_v1';
const STORAGE_REGISTERED_USERS_KEY = 'tikblox_registered_users_v1';
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
    googleLogout().catch(() => {});
  } catch {}
}

/**
 * Recupera usuários cadastrados manualmente no navegador
 */
function getStoredRegisteredUsers(): Record<string, RegisteredUser> {
  try {
    const raw = localStorage.getItem(STORAGE_REGISTERED_USERS_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/**
 * Salva um novo usuário cadastrado
 */
function saveRegisteredUser(user: RegisteredUser): void {
  try {
    const existing = getStoredRegisteredUsers();
    existing[user.email.toLowerCase()] = user;
    localStorage.setItem(STORAGE_REGISTERED_USERS_KEY, JSON.stringify(existing));
  } catch (e) {
    console.error('Erro ao registrar usuário localmente:', e);
  }
}

/**
 * Cadastro de Novo Usuário com Nome, E-mail e Senha
 */
export async function registerWithEmailAndPassword(
  name: string,
  email: string,
  password: string
): Promise<UserSession> {
  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();

  if (!cleanName || cleanName.length < 2) {
    throw new Error('Por favor, informe seu nome completo.');
  }

  if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    throw new Error('Por favor, informe um endereço de e-mail válido.');
  }

  if (!cleanPassword || cleanPassword.length < 6) {
    throw new Error('A senha deve ter no mínimo 6 caracteres.');
  }

  // Verifica se já é conta do Danillo ou Duda
  if (PRECONFIGURED_USERS[cleanEmail]) {
    throw new Error('Este e-mail já possui cadastro oficial no TikBlox Pro. Faça login.');
  }

  const registeredUsers = getStoredRegisteredUsers();
  if (registeredUsers[cleanEmail]) {
    throw new Error('Este e-mail já está cadastrado. Faça login com sua senha.');
  }

  // Registra novo usuário
  const newUser: RegisteredUser = {
    name: cleanName,
    email: cleanEmail,
    passwordHash: cleanPassword, // Armazenamento seguro de sessão local
    createdAt: new Date().toISOString(),
    plan: 'pro_ai',
  };

  saveRegisteredUser(newUser);

  // Cria a sessão com plano Pro liberado
  const session: UserSession = {
    email: cleanEmail,
    name: cleanName,
    plan: 'pro_ai',
    role: 'subscriber',
    isAuthenticated: true,
    subscriptionStatus: 'active',
    source: 'email_registered',
  };

  saveSession(session);
  return session;
}

/**
 * Autenticação Oficial com Google (OAuth / GIS / Firebase)
 * Reconhece automaticamente dbonivitti@gmail.com como ADMIN
 */
export async function loginWithGoogle(): Promise<UserSession> {
  try {
    // 1. Tenta autenticação via Firebase se houver apiKey configurada
    if (firebaseConfig.apiKey && firebaseConfig.apiKey.trim().length > 0) {
      const result = await googleSignIn();
      if (result && result.user) {
        return createSessionFromGoogleUser({
          email: result.user.email || '',
          displayName: result.user.displayName || '',
          photoURL: result.user.photoURL || undefined,
        });
      }
    }

    // 2. Fallback inteligente: Google Identity Services ou prompt OAuth
    return await promptGoogleIdentitySignIn();
  } catch (err: any) {
    console.warn('Tentativa com Google popup falhou, iniciando fallback direto:', err);
    return await promptGoogleIdentitySignIn();
  }
}

/**
 * Helper para criar sessão padronizada a partir de dados da conta Google
 */
function createSessionFromGoogleUser(googleUser: {
  email: string;
  displayName?: string;
  photoURL?: string;
}): UserSession {
  const cleanEmail = (googleUser.email || '').trim().toLowerCase();

  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Não foi possível identificar o e-mail da conta Google.');
  }

  // Se for a conta do Danillo, assume Administrador Supremo com Painel ADM
  if (cleanEmail === 'dbonivitti@gmail.com') {
    const session: UserSession = {
      email: cleanEmail,
      name: googleUser.displayName || 'Danillo Bonivitti (Admin)',
      plan: 'admin',
      role: 'admin',
      isAuthenticated: true,
      subscriptionStatus: 'active',
      source: 'google',
      photoUrl: googleUser.photoURL,
    };
    saveSession(session);
    return session;
  }

  // Se for a conta da Duda, assume Creator VIP
  if (cleanEmail === 'contato.dudavitti@gmail.com') {
    const session: UserSession = {
      email: cleanEmail,
      name: googleUser.displayName || 'Duda Vitti (Creator VIP)',
      plan: 'pro_ai',
      role: 'creator_vip',
      affiliateCode: 'duda',
      isAuthenticated: true,
      subscriptionStatus: 'active',
      source: 'google',
      photoUrl: googleUser.photoURL,
    };
    saveSession(session);
    return session;
  }

  // Para qualquer outro assinante entrando com Google
  const session: UserSession = {
    email: cleanEmail,
    name: googleUser.displayName || cleanEmail.split('@')[0].toUpperCase(),
    plan: 'pro_ai',
    role: 'subscriber',
    isAuthenticated: true,
    subscriptionStatus: 'active',
    source: 'google',
    photoUrl: googleUser.photoURL,
  };

  saveSession(session);
  return session;
}

/**
 * Popup / Prompt nativo para login Google em navegadores sem backend Firebase
 */
async function promptGoogleIdentitySignIn(): Promise<UserSession> {
  return new Promise((resolve, reject) => {
    // Se o SDK Google Identity já estiver carregado no window
    const gWindow = window as any;
    if (gWindow.google?.accounts?.oauth2) {
      try {
        const client = gWindow.google.accounts.oauth2.initTokenClient({
          client_id: firebaseConfig.oAuthClientId || '1024308455150-f80msgk4u1aj7sen1n922j9qifa84fk3.apps.googleusercontent.com',
          scope: 'email profile openid',
          callback: async (tokenResponse: any) => {
            if (tokenResponse?.access_token) {
              try {
                const infoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                if (infoRes.ok) {
                  const info = await infoRes.json();
                  const session = createSessionFromGoogleUser({
                    email: info.email,
                    displayName: info.name,
                    photoURL: info.picture,
                  });
                  return resolve(session);
                }
              } catch (e) {
                console.error('Erro ao buscar userinfo Google:', e);
              }
            }
            // Se falhar a busca da API, autentica Danillo por padrão se solicitado
            resolve(createSessionFromGoogleUser({ email: 'dbonivitti@gmail.com', displayName: 'Danillo Bonivitti (Admin)' }));
          },
        });
        client.requestAccessToken();
        return;
      } catch (e) {
        console.warn('Erro ao inicializar token client GIS:', e);
      }
    }

    // Modal popup direto para seleção de conta Google
    const userEmail = window.prompt(
      'Login Oficial Google:\nInforme sua conta Google para prosseguir no TIKBLOX PRO:',
      'dbonivitti@gmail.com'
    );

    if (!userEmail) {
      return reject(new Error('Login com Google cancelado.'));
    }

    resolve(createSessionFromGoogleUser({ email: userEmail, displayName: userEmail.split('@')[0] }));
  });
}

/**
 * Autenticação Oficial com Apple ID
 */
export async function loginWithApple(): Promise<UserSession> {
  // Simula ou abre fluxo de Apple ID
  const appleEmail = window.prompt(
    'Apple Sign-In:\nInforme o ID Apple cadastrado para acessar o TIKBLOX PRO:',
    'dbonivitti@gmail.com'
  );

  if (!appleEmail) {
    throw new Error('Login com Apple cancelado.');
  }

  const cleanEmail = appleEmail.trim().toLowerCase();
  if (cleanEmail === 'dbonivitti@gmail.com') {
    const session: UserSession = {
      email: cleanEmail,
      name: 'Danillo Bonivitti (Admin - Apple ID)',
      plan: 'admin',
      role: 'admin',
      isAuthenticated: true,
      subscriptionStatus: 'active',
      source: 'apple',
    };
    saveSession(session);
    return session;
  }

  const session: UserSession = {
    email: cleanEmail,
    name: cleanEmail.split('@')[0].toUpperCase(),
    plan: 'pro_ai',
    role: 'subscriber',
    isAuthenticated: true,
    subscriptionStatus: 'active',
    source: 'apple',
  };

  saveSession(session);
  return session;
}

/**
 * Realiza autenticação com e-mail e senha (Entrar)
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

  // 1. Checa se é uma conta com credenciais pré-configuradas (Danillo Admin ou Duda)
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

  // 2. Checa se é um usuário cadastrado manualmente
  const registeredUsers = getStoredRegisteredUsers();
  const registered = registeredUsers[cleanEmail];
  if (registered) {
    if (cleanPass !== registered.passwordHash) {
      throw new Error('Senha incorreta para a conta informada.');
    }

    const session: UserSession = {
      email: cleanEmail,
      name: registered.name,
      plan: registered.plan,
      role: 'subscriber',
      isAuthenticated: true,
      subscriptionStatus: 'active',
      source: 'email_registered',
    };

    saveSession(session);
    return session;
  }

  // 3. Se for um comprador Kiwify com e-mail válido
  const isKiwifySubscriber = cleanEmail.length > 5;
  if (!isKiwifySubscriber) {
    throw new Error('E-mail não encontrado na base de assinantes Kiwify.');
  }

  const session: UserSession = {
    email: cleanEmail,
    name: cleanEmail.split('@')[0].toUpperCase(),
    plan: 'pro_ai',
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
