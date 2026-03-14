import * as Sentry from '@sentry/react';
import { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    if (import.meta.env.PROD && Sentry) {
      Sentry.captureException(error, { extra: errorInfo as Record<string, unknown> });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex items-center justify-center min-h-[60vh] px-4">
          <div role="alert" className="glass-card rounded-xl p-8 max-w-md text-center">
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-white font-bold text-lg mb-2">
              {navigator.language.startsWith('fr') ? 'Une erreur est survenue' : 'Something went wrong'}
            </h2>
            <p className="text-gray-300 text-sm mb-6">
              {navigator.language.startsWith('fr')
                ? 'Une erreur inattendue est survenue. Essayez de rafraîchir la page.'
                : 'An unexpected error occurred. Please try refreshing the page.'}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="gradient-btn text-white px-6 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 hover:brightness-110"
            >
              {navigator.language.startsWith('fr') ? 'Rafraîchir la page' : 'Refresh Page'}
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
