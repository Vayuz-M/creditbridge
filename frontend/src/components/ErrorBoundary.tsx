import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f7f9fc] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-elevated p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Something went wrong
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                An unexpected interface error occurred. Your financial assessment data remains safe on the server.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] font-mono text-slate-600 text-left overflow-x-auto max-h-24">
                {this.state.error.message}
              </div>
            )}

            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-light text-white text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center space-x-1.5"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Go to Homepage</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
