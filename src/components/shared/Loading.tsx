/**
 * Loading Component
 * Displays loading states
 */

import { Loader } from 'lucide-react';

interface LoadingProps {
  fullScreen?: boolean;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Loading({ fullScreen = false, message, size = 'md' }: LoadingProps) {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <Loader className={`${sizeMap[size]} animate-spin text-green-600`} />
      {message && (
        <p className="text-neutral-600 dark:text-neutral-400 text-sm">{message}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm z-50">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      {content}
    </div>
  );
}
