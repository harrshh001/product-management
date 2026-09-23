'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getProductById, deleteProduct } from '@/lib/api/products';
import { Product } from '@/lib/api/types';
import { useProducts } from '@/lib/context/ProductsContext';
import { StockBadge, RatingBadge, CategoryBadge, LocalBadge } from '@/components/common/Badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import {
  ArrowLeft,
  Edit3,
  Trash2,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Package,
  Calendar,
  User,
  Star,
  Maximize2,
  FileQuestion,
} from 'lucide-react';
import axios from 'axios';

interface ProductDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;
  const router = useRouter();

  const { applyOverlayToSingle, deleteLocalProduct } = useProducts();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [is404, setIs404] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Delete dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const loadProduct = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setIs404(false);

    try {
      const data = await getProductById(productId);

      // Check against local session overlay (e.g. if edited or deleted)
      const mergedProduct = applyOverlayToSingle(data);

      if (!mergedProduct) {
        setIs404(true);
        setProduct(null);
      } else {
        setProduct(mergedProduct);
        setSelectedImage(
          mergedProduct.images && mergedProduct.images.length > 0
            ? mergedProduct.images[0]
            : mergedProduct.thumbnail || ''
        );
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && (err.response?.status === 404 || err.response?.status === 400)) {
        setIs404(true);
      } else if (axios.isAxiosError(err)) {
        setErrorMessage(err.response?.data?.message || 'Failed to load product details.');
      } else {
        setErrorMessage('An unexpected error occurred while fetching product.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [productId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async () => {
    if (!product) return;
    setIsDeleting(true);
    try {
      await deleteProduct(product.id);
      deleteLocalProduct(product.id);
      router.push('/dashboard');
    } catch (err) {
      console.error('Failed to delete product:', err);
      alert('Failed to delete product. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20">
        <LoadingSpinner text="Loading product specifications and reviews..." size="lg" />
      </div>
    );
  }

  // Graceful Not Found view for bad IDs or deleted products
  if (is404) {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-white rounded-3xl border border-slate-200 p-10 text-center shadow-lg">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <FileQuestion className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Product Not Found</h2>
        <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
          We couldn&apos;t find any product matching ID #{productId}. It may have been removed or does
          not exist.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="max-w-2xl mx-auto my-12">
        <ErrorAlert message={errorMessage} onRetry={loadProduct} />
        <div className="text-center mt-4">
          <Link href="/dashboard" className="text-xs text-indigo-600 hover:underline font-semibold">
            ← Back to Products List
          </Link>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const imagesList =
    product.images && product.images.length > 0
      ? product.images
      : product.thumbnail
      ? [product.thumbnail]
      : [];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Products List
        </Link>

        <div className="flex items-center space-x-2.5">
          <Link
            href={`/dashboard/products/${product.id}/edit`}
            className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors shadow-sm"
          >
            <Edit3 className="w-3.5 h-3.5 mr-1.5" />
            Edit Product
          </Link>
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors shadow-sm"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Delete
          </button>
        </div>
      </div>

      {/* Main Product Showcase Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Gallery Column (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Main Active Image */}
            <div className="relative aspect-square w-full rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center shadow-inner group">
              {selectedImage ? (
                <Image
                  src={selectedImage}
                  alt={product.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-contain p-4 transition-transform group-hover:scale-105"
                  priority
                  unoptimized
                />
              ) : (
                <Package className="w-16 h-16 text-slate-300" />
              )}
              {product.discountPercentage ? (
                <div className="absolute top-3 left-3 bg-emerald-600 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-lg shadow-sm">
                  SAVE {product.discountPercentage}%
                </div>
              ) : null}
            </div>

            {/* Thumbnails Row */}
            {imagesList.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto pb-2">
                {imagesList.map((img, idx) => {
                  const isSelected = img === selectedImage;
                  return (
                    <button
                      key={`img-${idx}`}
                      onClick={() => setSelectedImage(img)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden bg-slate-50 border-2 shrink-0 transition-all ${
                        isSelected
                          ? 'border-indigo-600 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${product.title} view ${idx + 1}`}
                        fill
                        sizes="64px"
                        className="object-contain p-1"
                        unoptimized
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Details Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Header info */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <CategoryBadge category={product.category} />
                <RatingBadge rating={product.rating} />
                <StockBadge stock={product.stock} />
                {product.isLocal && <LocalBadge />}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {product.title}
              </h1>

              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1.5 font-medium">
                {product.brand && <span>Brand: <strong className="text-slate-800">{product.brand}</strong></span>}
                <span>SKU: <code className="text-slate-700 font-mono bg-slate-100 px-1.5 py-0.5 rounded">{product.sku || `#${product.id}`}</code></span>
              </div>
            </div>

            {/* Price Box */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                  Price
                </div>
                <div className="text-3xl font-black text-slate-900 mt-0.5">
                  ${Number(product.price).toFixed(2)}
                </div>
              </div>
              {product.discountPercentage && (
                <div className="text-right">
                  <div className="text-xs text-emerald-600 font-bold">
                    Special Promo
                  </div>
                  <div className="text-xs text-slate-400 line-through">
                    ${(product.price * (1 + product.discountPercentage / 100)).toFixed(2)}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Description
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              {product.dimensions && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                  <div className="flex items-center text-slate-400 font-semibold mb-1">
                    <Maximize2 className="w-3.5 h-3.5 mr-1 text-slate-500" />
                    Dimensions
                  </div>
                  <div className="font-mono text-slate-800">
                    {product.dimensions.width} × {product.dimensions.height} × {product.dimensions.depth} cm
                  </div>
                </div>
              )}

              {product.weight && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                  <div className="flex items-center text-slate-400 font-semibold mb-1">
                    <Package className="w-3.5 h-3.5 mr-1 text-slate-500" />
                    Weight
                  </div>
                  <div className="font-mono text-slate-800">{product.weight} kg</div>
                </div>
              )}

              {product.warrantyInformation && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                  <div className="flex items-center text-slate-400 font-semibold mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1 text-slate-500" />
                    Warranty
                  </div>
                  <div className="text-slate-800 font-medium truncate" title={product.warrantyInformation}>
                    {product.warrantyInformation}
                  </div>
                </div>
              )}

              {product.shippingInformation && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                  <div className="flex items-center text-slate-400 font-semibold mb-1">
                    <Truck className="w-3.5 h-3.5 mr-1 text-slate-500" />
                    Shipping
                  </div>
                  <div className="text-slate-800 font-medium truncate" title={product.shippingInformation}>
                    {product.shippingInformation}
                  </div>
                </div>
              )}

              {product.returnPolicy && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                  <div className="flex items-center text-slate-400 font-semibold mb-1">
                    <RotateCcw className="w-3.5 h-3.5 mr-1 text-slate-500" />
                    Return Policy
                  </div>
                  <div className="text-slate-800 font-medium truncate" title={product.returnPolicy}>
                    {product.returnPolicy}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              Customer Reviews ({product.reviews ? product.reviews.length : 0})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified buyer ratings & feedback from the live API
            </p>
          </div>
          <RatingBadge rating={product.rating} />
        </div>

        {!product.reviews || product.reviews.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No customer reviews available for this product yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {product.reviews.map((rev, idx) => (
              <div
                key={`rev-${idx}`}
                className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">{rev.reviewerName}</div>
                      <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5" />
                        {new Date(rev.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-600 italic">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Product"
        message={`Are you sure you want to delete "${product.title}"? This item will be removed from your current session view.`}
        confirmLabel="Confirm Delete"
        cancelLabel="Cancel"
        isConfirming={isDeleting}
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </div>
  );
}
