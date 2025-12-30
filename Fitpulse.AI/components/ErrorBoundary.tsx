import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center">
            <h1 className="text-4xl font-bold mb-4 text-red-400">Something went wrong</h1>
            <p className="text-slate-300 mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/';
              }}
              className="px-6 py-3 bg-brand-blue text-white rounded-lg font-semibold hover:bg-brand-cyan transition-colors"
            >
              Go to Home
            </button>
            <details className="mt-6 text-left">
              <summary className="cursor-pointer text-slate-400 mb-2">Error Details</summary>
              <pre className="bg-slate-900 p-4 rounded text-xs overflow-auto text-slate-300">
                {this.state.error?.stack}
              </pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

