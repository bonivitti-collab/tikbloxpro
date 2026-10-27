import React, { ReactNode, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import { LanguageProvider } from './i18n/LanguageContext.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: any) {
    console.error('TIKBLOX Global Error Boundary caught:', error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#1A1D27] text-white flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="w-16 h-16 rounded-2xl bg-[#FE2C55]/10 border border-[#FE2C55]/30 flex items-center justify-center mb-5 text-[#FE2C55] text-2xl font-bold">
            !
          </div>
          <h1 className="text-2xl font-black tracking-tight mb-2">TIKBLOX Radar em Recuperação</h1>
          <p className="text-gray-400 text-sm max-w-md mb-6 leading-relaxed">
            Ocorreu uma pequena oscilação no carregamento da interface. Clique abaixo para restaurar o radar de tendências imediatamente.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#FE2C55] to-[#25F4EE] text-white font-bold text-sm shadow-lg shadow-[#FE2C55]/20 hover:opacity-90 active:scale-95 transition-all cursor-pointer"
          >
            Recarregar Radar TIKBLOX
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Registra Service Worker PWA para suporte offline e atualização imediata (padrão AntiTrader)
registerSW({ immediate: true });

// Garante reload imediato quando um novo Service Worker assumir o controle no iOS PWA
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </ErrorBoundary>
  </StrictMode>,
);
