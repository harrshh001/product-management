'use client';

import React from 'react';
import { Search, X, Loader2 } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (newValue: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  hasActiveCategory?: boolean;
}

export function SearchBar({
  value,
  onChange,
  isLoading = false,
  placeholder = 'Search by title, description, or brand...',
  hasActiveCategory = false,
}: SearchBarProps) {
  return (
    <div className="relative w-full max-w-md">
      <div className="relative flex items-center">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </div>

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-9 py-2 bg-white border border-slate-300 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all text-slate-900"
        />

        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            title="Clear search"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
            <span className="sr-only">Clear search</span>
          </button>
        )}
      </div>

      {hasActiveCategory && !value && (
        <p className="mt-1 text-[11px] text-amber-600">
          💡 Note: Typing a search query will automatically reset the active category filter.
        </p>
      )}
    </div>
  );
}
