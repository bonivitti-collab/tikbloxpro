// src/components/Auth/LoginModal.tsx
// Modal de Autenticação com Google, Apple, E-mail e Cadastro de Nova Conta

import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, X, ExternalLink, User, Sparkles } from 'lucide-react';
import {
  loginWithEmailAndPassword,
  registerWithEmailAndPassword,
  loginWithGoogle,
  loginWithApple,
  UserSession,
} from '../../services/authService';
import { TikBloxLogo } from '../TikBloxLogo';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (session: UserSession) => void;
  onOpenPricing?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onOpenPricing,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Campos de Formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Login com Google (Danillo entra como Admin com 1 clique)
  const handleGoogleLogin = async () => {
    setError(null);
    setSocialLoading('google');
    try {
      const session = await loginWithGoogle();
      onLoginSuccess(session);
      onClose();
    } catch (err: any) {
      if (err?.message && !err.message.includes('cancelado')) {
        setError(err.message);
      }
    } finally {
      setSocialLoading(null);
    }
  };

  // Login com Apple ID
  const handleAppleLogin = async () => {
    setError(null);
    setSocialLoading('apple');
    try {
      const session = await loginWithApple();
      onLoginSuccess(session);
      onClose();
    } catch (err: any) {
      if (err?.message && !err.message.includes('cancelado')) {
        setError(err.message);
      }
    } finally {
      setSocialLoading(null);
    }
  };

  // Submissão do Formulário de E-mail
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'register') {
        if (password !== confirmPassword) {
          throw new Error('As senhas digitadas não coincidem.');
        }
        const session = await registerWithEmailAndPassword(name, email, password);
        onLoginSuccess(session);
        onClose();
      } else {
        const session = await loginWithEmailAndPassword(email, password);
        onLoginSuccess(session);
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || 'Erro ao processar autenticação. Verifique os dados informados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none overflow-y-auto">
      <div className="bg-[#0F121C] border border-white/10 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 text-white relative overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        {/* Glows de fundo cromáticos */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#25F4EE]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#FE2C55]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Botão fechar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
          title="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header do Modal com Logo 3D */}
        <div className="space-y-2 text-center pt-1">
          <div className="flex justify-center">
            <TikBloxLogo size="lg" theme="dark" animate={false} />
          </div>
          <h2 className="text-lg font-black tracking-tight text-white">
            {mode === 'login' ? 'Acessar TikBlox Pro' : 'Criar Nova Conta no TikBlox Pro'}
          </h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
            {mode === 'login'
              ? 'Entre com sua conta Google, Apple ou e-mail de assinante.'
              : 'Cadastre-se para liberar o radar de produtos virais e pronta entrega.'}
          </p>
        </div>

        {/* 1. BOTÕES DE ACESSO RÁPIDO SOCIAL: GOOGLE E APPLE */}
        <div className="space-y-2 pt-1">
          {/* Botão Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading || Boolean(socialLoading)}
            className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-3 shadow-md hover:shadow-lg disabled:opacity-50 active:scale-98"
          >
            {socialLoading === 'google' ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                <span>Conectando com o Google...</span>
              </span>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{mode === 'login' ? 'Continuar com o Google' : 'Cadastrar com o Google'}</span>
              </>
            )}
          </button>

          {/* Botão Apple */}
          <button
            type="button"
            onClick={handleAppleLogin}
            disabled={loading || Boolean(socialLoading)}
            className="w-full py-3 px-4 rounded-xl bg-black hover:bg-zinc-900 border border-white/20 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-3 shadow-md hover:shadow-lg disabled:opacity-50 active:scale-98"
          >
            {socialLoading === 'apple' ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Conectando com a Apple...</span>
              </span>
            ) : (
              <>
                <svg className="w-4 h-4 fill-current" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.59-7.71-11.66-14.01-6.1-9.46-10.9-19.82-14.41-31.07-3.51-11.26-5.27-22.05-5.27-32.39 0-14.67 3.73-26.69 11.19-36.08 7.46-9.39 16.66-14.2 27.6-14.43 4.89 0 10.37 1.34 16.44 4.02 6.07 2.68 10.15 4.08 12.24 4.19 1.74 0 5.86-1.4 12.35-4.19 6.49-2.79 11.96-4.08 16.43-3.86 12.61.64 22.58 5.48 29.89 14.52-11.08 6.74-16.51 15.98-16.29 27.71.22 9.13 3.81 16.96 10.77 23.49 6.96 6.53 15.22 10.22 24.79 11.08-2.61 7.82-5.98 15.66-10.12 23.53zM119.22 31.84c0-7.18 2.61-14.13 7.83-20.87 5.22-6.74 11.85-10.97 19.89-12.71.43 1.09.65 2.17.65 3.26 0 7.17-2.72 14.13-8.15 20.87-5.43 6.74-12.18 10.87-20.22 12.39v-2.94z" />
                </svg>
                <span>{mode === 'login' ? 'Continuar com a Apple' : 'Cadastrar com a Apple'}</span>
              </>
            )}
          </button>
        </div>

        {/* Separador Visual */}
        <div className="relative flex items-center justify-center my-1">
          <div className="border-t border-white/10 w-full" />
          <span className="bg-[#0F121C] px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
            ou {mode === 'login' ? 'entre com e-mail' : 'cadastre seu e-mail'}
          </span>
          <div className="border-t border-white/10 w-full" />
        </div>

        {/* Abas Alternadoras: Entrar / Criar Conta */}
        <div className="grid grid-cols-2 p-1 bg-white/5 rounded-xl border border-white/10 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-gradient-to-r from-[#25F4EE] to-[#00D2C4] text-[#090D16] font-black shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Já tenho conta
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-gradient-to-r from-[#25F4EE] to-[#00D2C4] text-[#090D16] font-black shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Criar conta nova
          </button>
        </div>

        {/* Formulário de E-mail e Senha */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          
          {/* Campo Nome (Apenas modo cadastro) */}
          {mode === 'register' && (
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 block">
                Nome Completo:
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome ou da sua loja"
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#25F4EE] transition font-medium"
                />
              </div>
            </div>
          )}

          {/* Campo E-mail */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-300 block">
              E-mail:
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#25F4EE] transition font-medium"
              />
            </div>
          </div>

          {/* Campo Senha */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-300 block">
              {mode === 'register' ? 'Crie uma Senha (mínimo 6 dígitos):' : 'Senha de Acesso:'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'register' ? 'Escolha sua senha secreta' : 'Digite sua senha'}
                className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#25F4EE] transition font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition cursor-pointer"
                title={showPassword ? 'Ocultar senha' : 'Ver senha'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirmar Senha (Apenas modo cadastro) */}
          {mode === 'register' && (
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 block">
                Confirmar Senha:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita sua senha"
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#25F4EE] transition font-medium"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs leading-relaxed animate-in fade-in">
              {error}
            </div>
          )}

          {/* Botão Principal de Submissão */}
          <button
            type="submit"
            disabled={loading || Boolean(socialLoading)}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#25F4EE] via-[#00D2C4] to-[#25F4EE] text-[#0F121C] font-black text-xs uppercase tracking-wider transition cursor-pointer hover:brightness-105 active:scale-98 shadow-[0_4px_20px_rgba(37,244,238,0.3)] flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            <span>
              {loading
                ? 'Processando...'
                : mode === 'register'
                ? 'Criar Minha Conta & Acessar'
                : 'Entrar no Terminal'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Rodapé / Link de compra na Kiwify */}
        <div className="pt-1 text-center text-xs text-slate-400 space-y-1 border-t border-white/5">
          <p className="text-[11px]">Já comprou pela Kiwify ou deseja assinar?</p>
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenPricing) onOpenPricing();
            }}
            className="font-bold text-[#25F4EE] hover:underline inline-flex items-center gap-1 cursor-pointer text-xs"
          >
            <span>Ver Planos e Assinar na Kiwify (a partir de R$ 37/mês)</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

      </div>
    </div>
  );
};
