'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/api/types';
import { StockBadge, RatingBadge, CategoryBadge, LocalBadge } from '../common/Badge';
import { Eye, Edit3, Trash2, ImageOff } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onDeleteClick: (product: Product) => void;
}

export function ProductCard({ product, onDeleteClick }: ProductCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      <div>
        <div className="flex items-start space-x-3">
          {/* Thumbnail */}
          <div className="relative w-16 h-16 rounded-lg bg-slate-100 border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
            {product.thumbnail ? (
              <Image
                src={product.thumbnail}
                alt={product.title}
                fill
                sizes="64px"
                className="object-contain p-1"
                unoptimized
              />
            ) : (
              <ImageOff className="w-6 h-6 text-slate-400" />
            )}
          </div>

          {/* Title & Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <Link
                href={`/dashboard/products/${product.id}`}
                className="font-bold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1 text-sm"
              >
                {product.title}
              </Link>
              {product.isLocal && <LocalBadge />}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {product.brand ? `${product.brand} • ` : ''}
              <span className="font-mono text-[10px] text-slate-400">#{product.id}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5 items-center">
              <CategoryBadge category={product.category} />
              <RatingBadge rating={product.rating} />
            </div>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100">
          <div>
            <div className="text-base font-extrabold text-slate-900">
              ${Number(product.price).toFixed(2)}
            </div>
            {product.discountPercentage ? (
              <div className="text-[10px] text-emerald-600 font-semibold">
                -{product.discountPercentage}% off
              </div>
            ) : null}
          </div>
          <StockBadge stock={product.stock} />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 grid grid-cols-3 gap-2 pt-3 border-t border-slate-100">
        <Link
          href={`/dashboard/products/${product.id}`}
          className="flex items-center justify-center py-1.5 px-2 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-lg text-xs font-medium border border-slate-200 transition-colors"
        >
          <Eye className="w-3.5 h-3.5 mr-1" />
          View
        </Link>
        <Link
          href={`/dashboard/products/${product.id}/edit`}
          className="flex items-center justify-center py-1.5 px-2 bg-slate-50 hover:bg-amber-50 hover:text-amber-600 text-slate-600 rounded-lg text-xs font-medium border border-slate-200 transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5 mr-1" />
          Edit
        </Link>
        <button
          onClick={() => onDeleteClick(product)}
          className="flex items-center justify-center py-1.5 px-2 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-lg text-xs font-medium border border-slate-200 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5 mr-1" />
          Delete
        </button>
      </div>
    </div>
  );
}
