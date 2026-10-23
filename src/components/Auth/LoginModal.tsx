// src/components/Auth/LoginModal.tsx
// Modal de Login do Assinante integrado ao ecossistema Kiwify

import React, { useState } from 'react';
import { Bot, Mail, Lock, ArrowRight, ShieldCheck, CheckCircle2, Sparkles, X, ExternalLink } from 'lucide-react';
import { loginWithEmail, startGuestDemoSession, UserSession } from '../../services/authService';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const session = await loginWithEmail(email);
      onLoginSuccess(session);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Erro ao realizar login. Verifique seu e-mail de compra.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = () => {
    const session = startGuestDemoSession();
    onLoginSuccess(session);
    onClose();
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
            <img
              src="/tikblox-logo.png"
              alt="TIKBLOX PRO"
              className="h-10 sm:h-11 w-auto object-contain drop-shadow-[0_2px_16px_rgba(0,0,0,0.6)]"
            />
          </div>
          <h2 className="text-lg font-black tracking-tight text-white">
            Acessar Painel de Membro
          </h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Digite o mesmo e-mail que você utilizou ao assinar na <strong>Kiwify</strong> para liberar seu painel.
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 block">
              E-mail de Assinante (Kiwify):
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
            <span>{loading ? 'Validando Acesso...' : 'Acessar Terminal Agora'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Divisor */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-white/10 w-full" />
          <span className="bg-[#0F121C] px-3 text-[10px] uppercase font-bold text-slate-500 shrink-0">
            Ou teste sem compromisso
          </span>
          <div className="border-t border-white/10 w-full" />
        </div>

        {/* Botão de Degustação / Demo */}
        <button
          type="button"
          onClick={handleDemoAccess}
          className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#25F4EE]" />
          <span>Acessar Modo Demonstração (Grátis)</span>
        </button>

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
            <span>Ver Planos a partir de R$ 37/mês</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

      </div>
    </div>
  );
};
