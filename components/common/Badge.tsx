import React from 'react';
import { Star, CheckCircle, AlertTriangle, XCircle, Sparkles } from 'lucide-react';

interface StockBadgeProps {
  stock: number;
}

export function StockBadge({ stock }: StockBadgeProps) {
  if (stock <= 0) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 border border-rose-200">
        <XCircle className="w-3 h-3 mr-1 text-rose-500" />
        Out of Stock
      </span>
    );
  }

  if (stock < 10) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
        <AlertTriangle className="w-3 h-3 mr-1 text-amber-600" />
        Low Stock ({stock})
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
      <CheckCircle className="w-3 h-3 mr-1 text-emerald-600" />
      In Stock ({stock})
    </span>
  );
}

interface RatingBadgeProps {
  rating: number;
}

export function RatingBadge({ rating }: RatingBadgeProps) {
  const rounded = Number(rating).toFixed(1);
  const isHigh = rating >= 4.5;
  const isMedium = rating >= 3.5 && rating < 4.5;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${
        isHigh
          ? 'bg-amber-50 text-amber-700 border border-amber-200/80'
          : isMedium
          ? 'bg-blue-50 text-blue-700 border border-blue-200/80'
          : 'bg-slate-100 text-slate-700 border border-slate-200'
      }`}
    >
      <Star className="w-3 h-3 mr-1 fill-amber-400 text-amber-400" />
      {rounded}
    </span>
  );
}

interface CategoryBadgeProps {
  category: string;
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  const formatted = category.replace(/-/g, ' ');
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 capitalize border border-slate-200">
      {formatted}
    </span>
  );
}

export function LocalBadge() {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200" title="Created/modified locally in this session">
      <Sparkles className="w-2.5 h-2.5 mr-0.5 text-indigo-600" />
      Session Item
    </span>
  );
}
