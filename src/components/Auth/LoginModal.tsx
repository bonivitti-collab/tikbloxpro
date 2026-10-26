// src/components/Auth/LoginModal.tsx
// Modal de Login do Assinante e Acesso Administrativo / Creator VIP

import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, X, ExternalLink } from 'lucide-react';
import { loginWithEmailAndPassword, UserSession } from '../../services/authService';
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const session = await loginWithEmailAndPassword(email, password);
      onLoginSuccess(session);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Erro ao realizar login. Verifique seu e-mail e senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-[#0F121C] border border-white/10 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 text-white relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Glow de fundo */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#25F4EE]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#FE2C55]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Botão fechar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header do Login */}
        <div className="space-y-3 text-center pt-2">
          <div className="flex justify-center">
            <TikBloxLogo size="lg" theme="dark" animate={false} />
          </div>
          <h2 className="text-lg font-black tracking-tight text-white">
            Acessar Terminal TIKBLOX PRO
          </h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Informe suas credenciais ou o e-mail cadastrado na <strong>Kiwify</strong>.
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Campo E-mail */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 block">
              E-mail de Acesso:
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#25F4EE] transition font-medium"
              />
            </div>
          </div>

          {/* Campo Senha */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-300 block">
                Senha de Acesso:
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#25F4EE] transition font-medium"
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

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#25F4EE] via-[#00D2C4] to-[#25F4EE] text-[#0F121C] font-black text-xs uppercase tracking-wider transition cursor-pointer hover:brightness-105 active:scale-95 shadow-[0_4px_20px_rgba(37,244,238,0.3)] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? 'Validando Credenciais...' : 'Entrar no Terminal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Rodapé / Link para comprar se não tiver conta */}
        <div className="pt-2 text-center text-xs text-slate-400 space-y-1">
          <p>Ainda não é assinante do TikBlox Pro?</p>
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenPricing) onOpenPricing();
            }}
            className="font-bold text-[#25F4EE] hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Assinar Agora na Kiwify (a partir de R$ 37/mês)</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

      </div>
    </div>
  );
};
