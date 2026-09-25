import React, { ReactNode, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
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
        <div className="min-h-screen bg-[#010101] text-white flex flex-col items-center justify-center p-6 text-center font-sans">
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

// Safe ServiceWorker registration for PWA installability (production only)
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    if (import.meta.env.PROD) {
      const isTopLevel = window.self === window.top;
      if (isTopLevel) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js').catch((err) => {
            console.warn('PWA service worker registration notice:', err);
          });
        });
      }
    } else {
      // In development mode, unregister any active service worker to prevent intercepting Vite dev server modules
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister();
        }
      });
    }
  } catch (swErr) {
    console.warn('PWA service worker check ignored:', swErr);
  }
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
