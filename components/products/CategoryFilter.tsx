'use client';

import React from 'react';
import { Category } from '@/lib/api/types';
import { Filter } from 'lucide-react';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (categorySlug: string) => void;
  isLoading?: boolean;
  hasActiveSearch?: boolean;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
  isLoading = false,
  hasActiveSearch = false,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-col">
      <div className="relative inline-flex items-center">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Filter className="w-3.5 h-3.5" />
        </div>
        <select
          id="category-filter-select"
          value={selectedCategory || ''}
          onChange={(e) => onCategoryChange(e.target.value)}
          disabled={isLoading}
          className="pl-8 pr-8 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all cursor-pointer disabled:opacity-50"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>
      {hasActiveSearch && (
        <span className="text-[10px] text-amber-600 mt-0.5">
          *Choosing category clears search
        </span>
      )}
    </div>
  );
}
