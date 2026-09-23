'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getProductById, updateProduct } from '@/lib/api/products';
import { Product, ProductFormData } from '@/lib/api/types';
import { useProducts } from '@/lib/context/ProductsContext';
import { ProductForm } from '@/components/products/ProductForm';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import axios from 'axios';

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;
  const router = useRouter();

  const { applyOverlayToSingle, updateLocalProduct } = useProducts();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [is404, setIs404] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const loadProduct = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setIs404(false);

    try {
      const data = await getProductById(productId);
      const merged = applyOverlayToSingle(data);

      if (!merged) {
        setIs404(true);
      } else {
        setProduct(merged);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && (err.response?.status === 404 || err.response?.status === 400)) {
        setIs404(true);
      } else if (axios.isAxiosError(err)) {
        setErrorMessage(err.response?.data?.message || 'Failed to load product for editing.');
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

  const handleSubmit = async (formData: ProductFormData) => {
    setIsSubmitting(true);
    try {
      await updateProduct(productId, formData);

      // Merge edits into local session overlay
      updateLocalProduct(Number(productId), formData);

      router.push(`/dashboard/products/${productId}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20">
        <LoadingSpinner text="Fetching product data for editing..." size="lg" />
      </div>
    );
  }

  if (is404) {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-white rounded-3xl border border-slate-200 p-10 text-center shadow-lg">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <FileQuestion className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Product Not Found</h2>
        <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
          Cannot edit product #{productId} because it does not exist or was deleted in this session.
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
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="py-6">
      <ProductForm
        initialData={product}
        isEditMode={true}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
