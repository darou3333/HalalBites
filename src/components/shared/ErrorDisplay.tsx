/**
 * Error Component
 * Displays error messages
 */

import { AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/types';

interface ErrorDisplayProps {
  error: Error | ApiError | string | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  variant?: 'card' | 'alert' | 'inline';
}

export function ErrorDisplay({
  error,
  onRetry,
  onDismiss,
  variant = 'card',
}: ErrorDisplayProps) {
  if (!error) return null;

  let message = '';
  if (typeof error === 'string') {
    message = error;
  } else if (error instanceof Error) {
    message = error.message;
  } else {
    message = 'An error occurred';
  }

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
        <span className="text-sm text-red-600 dark:text-red-400">{message}</span>
        {onDismiss && (
          <button onClick={onDismiss} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  if (variant === 'alert') {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
            <p className="mt-2 text-sm text-red-700 dark:text-red-300">{message}</p>
            {(onRetry || onDismiss) && (
              <div className="mt-4 flex gap-2">
                {onRetry && (
                  <Button
                    onClick={onRetry}
                    size="sm"
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Try again
                  </Button>
                )}
                {onDismiss && (
                  <Button
                    onClick={onDismiss}
                    size="sm"
                    variant="outline"
                    className="border-red-200 hover:bg-red-100 dark:hover:bg-red-900/30"
                  >
                    Dismiss
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // card variant
  return (
    <div className="bg-white dark:bg-neutral-900 border border-red-200 dark:border-red-800 rounded-lg p-6">
      <div className="flex gap-4">
        <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-red-900 dark:text-red-200 mb-1">
            Something went wrong
          </h3>
          <p className="text-sm text-red-700 dark:text-red-300 mb-4">{message}</p>
          {(onRetry || onDismiss) && (
            <div className="flex gap-2">
              {onRetry && (
                <Button onClick={onRetry} size="sm" className="bg-red-600 hover:bg-red-700">
                  Try again
                </Button>
              )}
              {onDismiss && (
                <Button onClick={onDismiss} size="sm" variant="outline">
                  Dismiss
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
