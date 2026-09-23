'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCategories } from '@/lib/api/products';
import { Category, Product, ProductFormData } from '@/lib/api/types';
import { Loader2, ArrowLeft, Save, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

interface ProductFormProps {
  initialData?: Product | null;
  isEditMode?: boolean;
  onSubmit: (data: ProductFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function ProductForm({
  initialData,
  isEditMode = false,
  onSubmit,
  isSubmitting,
}: ProductFormProps) {
  const router = useRouter();

  // Form Fields
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [price, setPrice] = useState(initialData ? String(initialData.price) : '');
  const [discountPercentage, setDiscountPercentage] = useState(
    initialData?.discountPercentage ? String(initialData.discountPercentage) : ''
  );
  const [stock, setStock] = useState(initialData ? String(initialData.stock) : '');
  const [brand, setBrand] = useState(initialData?.brand || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [thumbnail, setThumbnail] = useState(initialData?.thumbnail || '');

  // Categories list
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState<boolean>(true);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadCategories() {
      try {
        const data = await getCategories();
        if (isMounted) {
          setCategories(data);
          // Set default category if none set
          if (!category && data.length > 0 && !isEditMode) {
            setCategory(data[0].slug);
          }
        }
      } catch (err) {
        console.error('Failed to load categories for form:', err);
      } finally {
        if (isMounted) setIsCategoriesLoading(false);
      }
    }
    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Product title is required.';
    } else if (title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters.';
    }

    if (!description.trim()) {
      newErrors.description = 'Product description is required.';
    }

    const parsedPrice = parseFloat(price);
    if (!price || isNaN(parsedPrice) || parsedPrice <= 0) {
      newErrors.price = 'Please enter a valid price greater than $0.00.';
    }

    const parsedStock = parseInt(stock, 10);
    if (!stock || isNaN(parsedStock) || parsedStock < 0) {
      newErrors.stock = 'Stock count must be 0 or a positive integer.';
    }

    if (!category) {
      newErrors.category = 'Please select a valid category.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent double submit

    if (!validate()) {
      return;
    }

    setSubmitError(null);

    try {
      const payload: ProductFormData = {
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price),
        discountPercentage: discountPercentage ? parseFloat(discountPercentage) : undefined,
        stock: parseInt(stock, 10),
        brand: brand.trim() || undefined,
        category: category.trim(),
        thumbnail: thumbnail.trim() || undefined,
      };

      await onSubmit(payload);
    } catch (err: unknown) {
      console.error('Form submission failed:', err);
      setSubmitError('Failed to save product changes. Please check your inputs and try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-indigo-600 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {isEditMode ? `Edit Product: ${initialData?.title}` : 'Add New Product'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isEditMode
              ? 'Update specifications, pricing, stock, and imagery'
              : 'Create a new catalog item and publish to inventory'}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            id="product-form-submit-btn"
            disabled={isSubmitting}
            className="inline-flex items-center px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                {isEditMode ? 'Saving Changes...' : 'Creating Product...'}
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 mr-1.5" />
                {isEditMode ? 'Update Product' : 'Save & Publish'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Persistence Note Banner */}
      <div className="rounded-xl bg-amber-50 border border-amber-200 p-3.5 flex items-start gap-2 text-xs text-amber-900 shadow-sm">
        <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Local Session Overlay:</span> DummyJSON is a mock backend
          and echoes mutations without altering remote databases. This item will be updated in your
          active session memory across tables, filters, and detail pages.
        </div>
      </div>

      {/* Global Submit Error Banner */}
      {submitError && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 flex items-center gap-2 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Form Fields Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Basic Information */}
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
            General Details
          </h2>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-xs font-semibold text-slate-700 mb-1">
                Product Title <span className="text-rose-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Wireless Noise-Canceling Headphones"
                disabled={isSubmitting}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                  errors.title
                    ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/20'
                    : 'border-slate-300 focus:ring-indigo-500/20 focus:border-indigo-600'
                }`}
              />
              {errors.title && <p className="text-xs text-rose-600 mt-1">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-xs font-semibold text-slate-700 mb-1">
                Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a comprehensive product description, highlights, and features..."
                disabled={isSubmitting}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                  errors.description
                    ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/20'
                    : 'border-slate-300 focus:ring-indigo-500/20 focus:border-indigo-600'
                }`}
              />
              {errors.description && (
                <p className="text-xs text-rose-600 mt-1">{errors.description}</p>
              )}
            </div>

            {/* Brand & Category Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="brand" className="block text-xs font-semibold text-slate-700 mb-1">
                  Brand Name
                </label>
                <input
                  id="brand"
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Sony, Apple, Nike"
                  disabled={isSubmitting}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-xs font-semibold text-slate-700 mb-1">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={isSubmitting || isCategoriesLoading}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 transition-all ${
                    errors.category
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-300 focus:ring-indigo-500/20 focus:border-indigo-600'
                  }`}
                >
                  <option value="" disabled>
                    {isCategoriesLoading ? 'Loading categories...' : 'Select a category'}
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.slug} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-xs text-rose-600 mt-1">{errors.category}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
            Pricing & Inventory
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-xs font-semibold text-slate-700 mb-1">
                Price ($ USD) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-sm font-medium">
                  $
                </span>
                <input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="29.99"
                  disabled={isSubmitting}
                  className={`w-full pl-7 pr-3.5 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                    errors.price
                      ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/20'
                      : 'border-slate-300 focus:ring-indigo-500/20 focus:border-indigo-600'
                  }`}
                />
              </div>
              {errors.price && <p className="text-xs text-rose-600 mt-1">{errors.price}</p>}
            </div>

            {/* Discount Percentage */}
            <div>
              <label htmlFor="discount" className="block text-xs font-semibold text-slate-700 mb-1">
                Discount Percentage (%)
              </label>
              <div className="relative">
                <input
                  id="discount"
                  type="number"
                  step="0.1"
                  min="0"
                  max="99"
                  value={discountPercentage}
                  onChange={(e) => setDiscountPercentage(e.target.value)}
                  placeholder="e.g. 10.5"
                  disabled={isSubmitting}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
              </div>
            </div>

            {/* Stock Quantity */}
            <div>
              <label htmlFor="stock" className="block text-xs font-semibold text-slate-700 mb-1">
                Stock Units in Inventory <span className="text-rose-500">*</span>
              </label>
              <input
                id="stock"
                type="number"
                min="0"
                step="1"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="50"
                disabled={isSubmitting}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                  errors.stock
                    ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/20'
                    : 'border-slate-300 focus:ring-indigo-500/20 focus:border-indigo-600'
                }`}
              />
              {errors.stock && <p className="text-xs text-rose-600 mt-1">{errors.stock}</p>}
            </div>
          </div>
        </div>

        {/* Imagery */}
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
            Media & Imagery
          </h2>

          <div>
            <label htmlFor="thumbnail" className="block text-xs font-semibold text-slate-700 mb-1">
              Thumbnail Image URL (optional)
            </label>
            <input
              id="thumbnail"
              type="url"
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
              placeholder="https://cdn.dummyjson.com/products/images/..."
              disabled={isSubmitting}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              If left blank, a default placeholder graphic will be displayed.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
