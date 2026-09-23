import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({ text = 'Loading data...', size = 'md' }: LoadingSpinnerProps) {
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 space-y-3">
      <Loader2 className={`${iconSizes[size]} text-indigo-600 animate-spin`} />
      {text && <p className="text-xs font-medium text-slate-500 animate-pulse">{text}</p>}
    </div>
  );
}

export function TableSkeletonRows({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-slate-100">
          <td className="px-6 py-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-slate-200 rounded-lg shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="h-4 bg-slate-200 rounded w-20" />
          </td>
          <td className="px-6 py-4">
            <div className="h-4 bg-slate-200 rounded w-16" />
          </td>
          <td className="px-6 py-4">
            <div className="h-5 bg-slate-200 rounded w-14" />
          </td>
          <td className="px-6 py-4">
            <div className="h-5 bg-slate-200 rounded w-20" />
          </td>
          <td className="px-6 py-4 text-right">
            <div className="flex items-center justify-end space-x-2">
              <div className="w-7 h-7 bg-slate-200 rounded-md" />
              <div className="w-7 h-7 bg-slate-200 rounded-md" />
              <div className="w-7 h-7 bg-slate-200 rounded-md" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}

export function CardSkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 animate-pulse space-y-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 bg-slate-200 rounded-lg shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-slate-200 rounded w-4/5" />
              <div className="h-3 bg-slate-100 rounded w-2/5" />
            </div>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-slate-100">
            <div className="h-5 bg-slate-200 rounded w-16" />
            <div className="h-5 bg-slate-200 rounded w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
