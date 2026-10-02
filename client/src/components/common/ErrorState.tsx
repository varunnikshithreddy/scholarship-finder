import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'Failed to load scholarship details. Please check your connection and try again.',
  onRetry,
}) => {
  return (
    <div className="text-center py-12 px-6 bg-red-50/50 rounded-2xl border border-red-200 max-w-lg mx-auto my-8">
      <div className="w-14 h-14 mx-auto bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-4">
        <AlertTriangle className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 text-sm mb-6 leading-relaxed">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg text-red-700 bg-red-100 hover:bg-red-200 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
};
