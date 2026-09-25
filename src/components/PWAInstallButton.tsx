import React, { useState } from 'react';
import { Download, Share, PlusSquare, X, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA on Windows / Desktop / Mobile, do not crowd the navbar
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        id="pwa-install-btn"
        onClick={install}
        className="flex items-center gap-1.5 sm:gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-2.5 sm:px-3.5 py-1.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 active:scale-95 transition-all whitespace-nowrap shrink-0 cursor-pointer"
        title="Instalar TIKBLOX no Windows ou celular"
      >
        <Download className="w-3.5 h-3.5 shrink-0" />
        <span>Instalar App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          id="pwa-ios-install-btn"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-xl bg-slate-800/90 border border-slate-700 hover:border-slate-600 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white transition shrink-0 cursor-pointer whitespace-nowrap"
          title="Instalar TIKBLOX no iPhone"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>Instalar<span className="hidden sm:inline"> no iPhone</span></span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100 relative">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
                  <Download className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Instalar TIKBLOX no iOS</h3>
                  <p className="text-xs text-slate-400">Tenha o radar na sua tela de início</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-800">
                  <Share className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-medium">1. Toque no botão Compartilhar</strong>
                    <span>No rodapé do seu navegador Safari do iPhone.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-800">
                  <PlusSquare className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-medium">2. Adicionar à Tela de Início</strong>
                    <span>Role a lista para baixo e selecione esta opção.</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold py-2.5 text-xs transition"
              >
                Entendi
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Generic install helper button if beforeinstallprompt is not currently ready
  return (
    <button
      id="pwa-install-generic-btn"
      onClick={() => {
        alert('Para instalar o TIKBLOX como PWA: abra o menu do navegador (três pontinhos no topo) e clique em "Instalar aplicativo" ou "Adicionar à tela inicial".');
      }}
      className="flex items-center gap-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition"
      title="Instalar como aplicativo PWA"
    >
      <Download className="w-3.5 h-3.5 text-cyan-400" />
      <span className="hidden sm:inline">PWA App</span>
    </button>
  );
};
