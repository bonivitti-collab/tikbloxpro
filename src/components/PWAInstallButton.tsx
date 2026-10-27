// src/components/PWAInstallButton.tsx
// Botão Oficial e Modal Inteligente de Instalação do Aplicativo (PWA) no Celular (Android/iOS) e Computador (Windows/Mac)

import React, { useState } from 'react';
import { Download, Share, PlusSquare, X, Smartphone, Monitor } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'green' | 'navbar' | 'subtle';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'green',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // Se já estiver rodando instalado como App independente (standalone)
  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const installed = await install();
      if (!installed) setShowGuide(true);
    } else {
      setShowGuide(true);
    }
  };

  const styleClass =
    variant === 'green'
      ? 'bg-[#009B5A] hover:bg-[#00854D] text-white font-black shadow-md shadow-emerald-950/20 active:scale-95'
      : variant === 'navbar'
      ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
      : 'bg-white/10 hover:bg-white/15 text-white border border-white/10';

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs transition cursor-pointer whitespace-nowrap shrink-0 ${styleClass} ${className}`}
        title="Instalar TikBlox Pro no seu celular ou computador"
      >
        <Download className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
        <span>Instalar App</span>
      </button>

      {/* Modal Guia Universal de Instalação (iOS, Android, Windows, Mac) */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in select-none">
          <div className="w-full max-w-md rounded-3xl bg-[#0F1322] border border-white/15 p-6 sm:p-7 shadow-2xl text-slate-100 relative overflow-hidden">
            
            {/* Glow de fundo */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#009B5A]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#25F4EE]/20 rounded-full blur-3xl pointer-events-none" />

            <button
              onClick={() => setShowGuide(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-full bg-white/5 hover:bg-white/10 cursor-pointer transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-[#009B5A]/20 border border-[#009B5A]/40 flex items-center justify-center shrink-0">
                <Download className="w-6 h-6 text-[#00E585]" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">
                  Instalar TikBlox Pro no seu Aparelho
                </h3>
                <p className="text-xs text-slate-400">
                  Acesso rápido em 1 clique na sua tela de início sem precisar de loja
                </p>
              </div>
            </div>

            {isIOS ? (
              /* Instruções Específicas p/ iPhone (Safari) */
              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <Share className="w-5 h-5 text-[#25F4EE] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-bold text-xs">
                      1. Toque no botão Compartilhar
                    </strong>
                    <span className="text-slate-400 text-[11px]">
                      No rodapé do Safari do seu iPhone (o ícone de quadrado com uma seta para cima).
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <PlusSquare className="w-5 h-5 text-[#00E585] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-bold text-xs">
                      2. Selecione "Adicionar à Tela de Início"
                    </strong>
                    <span className="text-slate-400 text-[11px]">
                      Role a lista de ações um pouco para baixo e toque em Adicionar à Tela de Início.
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Instruções p/ Android / Chrome / Windows / Mac */
              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <Smartphone className="w-5 h-5 text-[#25F4EE] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-bold text-xs">
                      No Celular (Android / Chrome):
                    </strong>
                    <span className="text-slate-400 text-[11px]">
                      Toque nos <strong>três pontinhos</strong> no topo do navegador e selecione{' '}
                      <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <Monitor className="w-5 h-5 text-[#00E585] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-bold text-xs">
                      No Computador (Chrome / Edge):
                    </strong>
                    <span className="text-slate-400 text-[11px]">
                      Clique no ícone de <strong>computador com seta para baixo</strong> ao lado da barra de endereços URL para instalar como aplicativo nativo.
                    </span>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowGuide(false)}
              className="mt-5 w-full rounded-xl bg-gradient-to-r from-[#009B5A] to-[#00C472] hover:brightness-105 text-white font-black py-3 text-xs uppercase tracking-wider transition cursor-pointer shadow-lg shadow-emerald-950/30"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
