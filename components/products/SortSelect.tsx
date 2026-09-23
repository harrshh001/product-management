'use client';

import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface SortSelectProps {
  sortBy: string;
  order: 'asc' | 'desc';
  onSortChange: (newSortBy: string, newOrder: 'asc' | 'desc') => void;
  isLoading?: boolean;
}

export function SortSelect({
  sortBy,
  order,
  onSortChange,
  isLoading = false,
}: SortSelectProps) {
  const sortOptions = [
    { value: '', label: 'Default Sorting' },
    { value: 'title', label: 'Title (Name)' },
    { value: 'price', label: 'Price' },
    { value: 'rating', label: 'Rating' },
  ];

  const handleFieldChange = (newField: string) => {
    // If selecting default, clear sort
    if (!newField) {
      onSortChange('', 'asc');
    } else {
      // Keep existing order or default to asc
      onSortChange(newField, order || 'asc');
    }
  };

  const toggleOrder = () => {
    const nextOrder = order === 'asc' ? 'desc' : 'asc';
    onSortChange(sortBy || 'title', nextOrder);
  };

  return (
    <div className="inline-flex items-center space-x-1.5">
      <div className="relative inline-flex items-center">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <ArrowUpDown className="w-3.5 h-3.5" />
        </div>
        <select
          id="sort-by-select"
          value={sortBy || ''}
          onChange={(e) => handleFieldChange(e.target.value)}
          disabled={isLoading}
          className="pl-8 pr-7 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all cursor-pointer disabled:opacity-50"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {sortBy && (
        <button
          type="button"
          onClick={toggleOrder}
          disabled={isLoading}
          title={`Switch to ${order === 'asc' ? 'Descending' : 'Ascending'}`}
          className="inline-flex items-center px-2.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors disabled:opacity-50"
        >
          {order === 'asc' ? (
            <>
              <ArrowUp className="w-3.5 h-3.5 mr-1 text-indigo-600" />
              Asc
            </>
          ) : (
            <>
              <ArrowDown className="w-3.5 h-3.5 mr-1 text-indigo-600" />
              Desc
            </>
          )}
        </button>
      )}
    </div>
  );
}
