'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Product } from '../api/types';

interface ProductsContextType {
  addedProducts: Product[];
  updatedProducts: Record<number, Partial<Product>>;
  deletedProductIds: number[];
  addLocalProduct: (product: Product) => void;
  updateLocalProduct: (id: number, updates: Partial<Product>) => void;
  deleteLocalProduct: (id: number) => void;
  applyOverlayToList: (
    remoteProducts: Product[],
    remoteTotal: number,
    filterCategory?: string,
    searchQuery?: string
  ) => { products: Product[]; total: number };
  applyOverlayToSingle: (remoteProduct: Product) => Product | null;
  resetLocalOverrides: () => void;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [addedProducts, setAddedProducts] = useState<Product[]>([]);
  const [updatedProducts, setUpdatedProducts] = useState<Record<number, Partial<Product>>>({});
  const [deletedProductIds, setDeletedProductIds] = useState<number[]>([]);

  // Record a newly created product locally
  const addLocalProduct = useCallback((product: Product) => {
    setAddedProducts((prev) => [
      { ...product, isLocal: true },
      ...prev.filter((p) => p.id !== product.id),
    ]);
  }, []);

  // Record an edit/update to an existing product locally
  const updateLocalProduct = useCallback((id: number, updates: Partial<Product>) => {
    setUpdatedProducts((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        ...updates,
      },
    }));

    // If it was an added product in this session, update it in addedProducts too
    setAddedProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  }, []);

  // Record a product deletion locally
  const deleteLocalProduct = useCallback((id: number) => {
    setDeletedProductIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setAddedProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // Merge remote products with local added, updated, and deleted state
  const applyOverlayToList = useCallback(
    (
      remoteProducts: Product[],
      remoteTotal: number,
      filterCategory?: string,
      searchQuery?: string
    ) => {
      const deletedSet = new Set(deletedProductIds);

      // 1. Filter out deleted products from remote list
      let list = remoteProducts.filter((p) => !deletedSet.has(p.id));

      // 2. Apply any local updates/edits to remote products
      list = list.map((p) => {
        if (updatedProducts[p.id]) {
          return { ...p, ...updatedProducts[p.id] };
        }
        return p;
      });

      // 3. Match added products against active search or category filters
      const matchingAdded = addedProducts.filter((p) => {
        if (deletedSet.has(p.id)) return false;

        if (searchQuery && searchQuery.trim().length > 0) {
          const q = searchQuery.toLowerCase();
          return (
            p.title.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
          );
        }

        if (filterCategory && filterCategory.trim().length > 0 && filterCategory !== 'all') {
          return p.category.toLowerCase() === filterCategory.toLowerCase();
        }

        return true;
      });

      // Avoid duplicate keys if an added product ID somehow exists in remote
      const existingIds = new Set(list.map((p) => p.id));
      const newItemsToAdd = matchingAdded.filter((p) => !existingIds.has(p.id));

      const mergedProducts = [...newItemsToAdd, ...list];
      const adjustedTotal = Math.max(0, remoteTotal + newItemsToAdd.length - (remoteProducts.length - list.length));

      return {
        products: mergedProducts,
        total: adjustedTotal,
      };
    },
    [addedProducts, updatedProducts, deletedProductIds]
  );

  // Apply local overlay to a single product detail view
  const applyOverlayToSingle = useCallback(
    (remoteProduct: Product): Product | null => {
      if (deletedProductIds.includes(remoteProduct.id)) {
        return null; // Treated as deleted / 404
      }

      let product = { ...remoteProduct };
      if (updatedProducts[product.id]) {
        product = { ...product, ...updatedProducts[product.id] };
      }
      return product;
    },
    [updatedProducts, deletedProductIds]
  );

  const resetLocalOverrides = useCallback(() => {
    setAddedProducts([]);
    setUpdatedProducts({});
    setDeletedProductIds([]);
  }, []);

  const value = useMemo(
    () => ({
      addedProducts,
      updatedProducts,
      deletedProductIds,
      addLocalProduct,
      updateLocalProduct,
      deleteLocalProduct,
      applyOverlayToList,
      applyOverlayToSingle,
      resetLocalOverrides,
    }),
    [
      addedProducts,
      updatedProducts,
      deletedProductIds,
      addLocalProduct,
      updateLocalProduct,
      deleteLocalProduct,
      applyOverlayToList,
      applyOverlayToSingle,
      resetLocalOverrides,
    ]
  );

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts(): ProductsContextType {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
}
