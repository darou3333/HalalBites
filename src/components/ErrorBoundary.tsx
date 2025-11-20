/**
 * Error Boundary Component
 * Catches errors in child components
 */

import { Component, ReactNode, ErrorInfo } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-neutral-900 px-4">
          <div className="max-w-md text-center">
            <div className="flex justify-center mb-6">
              <AlertCircle className="w-16 h-16 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
              Something went wrong
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <div className="flex gap-4">
              <Button onClick={this.handleReset} className="flex-1">
                Try again
              </Button>
              <Button
                onClick={() => (window.location.href = '/')}
                variant="outline"
                className="flex-1"
              >
                Go home
              </Button>
            </div>
            {(import.meta as any).env.DEV && (
              <pre className="mt-6 p-4 bg-neutral-100 dark:bg-neutral-800 rounded text-left text-xs overflow-auto text-red-600">
                {this.state.error?.stack}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
