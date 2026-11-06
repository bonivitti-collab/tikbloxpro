import React, { ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Recupera a árvore quando um render quebra. Estilos inline de propósito:
 * se o CSS não carregar, a tela de erro continua visível em vez de ficar branca.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('TIKBLOX Global Error Boundary caught:', error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          style={{
            minHeight: '100vh',
            boxSizing: 'border-box',
            background: '#1A1D27',
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            textAlign: 'center',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: 'rgba(254, 44, 85, 0.12)',
              border: '1px solid rgba(254, 44, 85, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
              color: '#FE2C55',
              fontSize: 28,
              fontWeight: 800,
            }}
          >
            !
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 8px' }}>
            Não foi possível abrir o radar
          </h1>
          <p style={{ color: '#cbd5e1', fontSize: 14, maxWidth: 440, lineHeight: 1.55, margin: 0 }}>
            O painel encontrou um erro ao montar sua sessão. O acesso continua salvo neste navegador.
            Recarregue para voltar à lista de produtos.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              marginTop: 24,
              padding: '12px 22px',
              borderRadius: 12,
              border: 0,
              background: '#FE2C55',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            Recarregar o radar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
