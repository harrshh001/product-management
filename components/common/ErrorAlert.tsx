import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorAlertProps {
  message?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export function ErrorAlert({
  message = 'Failed to load product data. Please check your connection and try again.',
  onRetry,
  isRetrying = false,
}: ErrorAlertProps) {
  return (
    <div className="rounded-xl bg-rose-50 border border-rose-200 p-6 text-center my-6 shadow-sm">
      <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-rose-900 mb-1">
        Unable to complete request
      </h3>
      <p className="text-sm text-rose-700 max-w-md mx-auto mb-4">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          disabled={isRetrying}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
          {isRetrying ? 'Retrying...' : 'Retry Request'}
        </button>
      )}
    </div>
  );
}
