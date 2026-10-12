import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
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
    console.error('Uncaught error in component:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 my-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl shadow-sm text-rose-900 dark:text-rose-200">
          <div className="flex items-start space-x-3">
            <span className="p-2 rounded-xl bg-rose-500 text-white shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </span>
            <div className="flex-1 space-y-2">
              <h3 className="font-bold text-sm">
                {this.props.fallbackTitle || 'Unable to render component view'}
              </h3>
              <p className="text-xs text-rose-700 dark:text-rose-300">
                {this.state.error?.message || 'A temporary rendering error occurred.'}
              </p>
              <button
                onClick={this.handleReset}
                className="mt-2 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload View</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
