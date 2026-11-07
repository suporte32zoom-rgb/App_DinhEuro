import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[DinhEuro ErrorBoundary] Erro capturado na árvore de componentes:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[300px] w-full flex items-center justify-center p-6 bg-[#0B1320] text-slate-100">
          <div className="max-w-md w-full bg-slate-900/90 border border-emerald-500/30 rounded-xl p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              €
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Módulo em Recuperação Automática
            </h3>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Identificamos uma oscilação na renderização deste painel financeiro. As cotações globais e dados do DinhEuro continuam seguros e operantes.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Reconectar Módulo
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-lg border border-slate-700 transition-all cursor-pointer"
              >
                Atualizar Página
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
