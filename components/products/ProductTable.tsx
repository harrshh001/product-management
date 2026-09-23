'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/api/types';
import { StockBadge, RatingBadge, CategoryBadge, LocalBadge } from '../common/Badge';
import { TableSkeletonRows } from '../common/LoadingSpinner';
import { Eye, Edit3, Trash2, ImageOff } from 'lucide-react';

interface ProductTableProps {
  products: Product[];
  isLoading: boolean;
  onDeleteClick: (product: Product) => void;
}

export function ProductTable({
  products,
  isLoading,
  onDeleteClick,
}: ProductTableProps) {
  return (
    <div className="hidden md:block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 tracking-wider">
            <tr>
              <th scope="col" className="px-6 py-3.5">
                Product
              </th>
              <th scope="col" className="px-6 py-3.5">
                Category
              </th>
              <th scope="col" className="px-6 py-3.5">
                Price
              </th>
              <th scope="col" className="px-6 py-3.5">
                Rating
              </th>
              <th scope="col" className="px-6 py-3.5">
                Stock Status
              </th>
              <th scope="col" className="px-6 py-3.5 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {isLoading ? (
              <TableSkeletonRows count={6} />
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">
                  No products matching your search or filters.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* Product Details (Image, Title, SKU) */}
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3.5">
                      <div className="relative w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
                        {product.thumbnail ? (
                          <Image
                            src={product.thumbnail}
                            alt={product.title}
                            fill
                            sizes="48px"
                            className="object-contain p-1 group-hover:scale-105 transition-transform"
                            unoptimized
                          />
                        ) : (
                          <ImageOff className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0 max-w-xs">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/dashboard/products/${product.id}`}
                            className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors truncate block"
                            title={product.title}
                          >
                            {product.title}
                          </Link>
                          {product.isLocal && <LocalBadge />}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          {product.brand ? `${product.brand} • ` : ''}
                          <span className="font-mono text-[11px] text-slate-400">
                            {product.sku ? `SKU: ${product.sku}` : `ID: #${product.id}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4">
                    <CategoryBadge category={product.category} />
                  </td>

                  {/* Price & Discount */}
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">
                      ${Number(product.price).toFixed(2)}
                    </div>
                    {product.discountPercentage ? (
                      <div className="text-[11px] text-emerald-600 font-medium">
                        -{product.discountPercentage}% off
                      </div>
                    ) : null}
                  </td>

                  {/* Rating */}
                  <td className="px-6 py-4">
                    <RatingBadge rating={product.rating} />
                  </td>

                  {/* Stock Status */}
                  <td className="px-6 py-4">
                    <StockBadge stock={product.stock} />
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <Link
                        href={`/dashboard/products/${product.id}`}
                        title="View details"
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="sr-only">View product</span>
                      </Link>
                      <Link
                        href={`/dashboard/products/${product.id}/edit`}
                        title="Edit product"
                        className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span className="sr-only">Edit product</span>
                      </Link>
                      <button
                        onClick={() => onDeleteClick(product)}
                        title="Delete product"
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="sr-only">Delete product</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
