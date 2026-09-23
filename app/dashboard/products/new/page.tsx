'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addProduct } from '@/lib/api/products';
import { ProductFormData } from '@/lib/api/types';
import { useProducts } from '@/lib/context/ProductsContext';
import { ProductForm } from '@/components/products/ProductForm';

export default function AddProductPage() {
  const router = useRouter();
  const { addLocalProduct } = useProducts();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (formData: ProductFormData) => {
    setIsSubmitting(true);
    try {
      const newProduct = await addProduct(formData);

      // Merge into local state so product appears in the dashboard for this session
      addLocalProduct({
        ...newProduct,
        rating: 4.5,
        thumbnail:
          formData.thumbnail ||
          'https://cdn.dummyjson.com/products/images/beauty/Essence%20Mascara%20Lash%20Princess/thumbnail.png',
        images: formData.thumbnail ? [formData.thumbnail] : [],
      });

      router.push('/dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-6">
      <ProductForm
        isEditMode={false}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
