'use client';

import React, { useState, useEffect, useRef, useCallback, useTransition, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { fetchProducts, getCategories, deleteProduct } from '@/lib/api/products';
import { Product, Category } from '@/lib/api/types';
import { useProducts } from '@/lib/context/ProductsContext';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { ProductTable } from '@/components/products/ProductTable';
import { ProductCard } from '@/components/products/ProductCard';
import { Pagination } from '@/components/products/Pagination';
import { SearchBar } from '@/components/products/SearchBar';
import { CategoryFilter } from '@/components/products/CategoryFilter';
import { SortSelect } from '@/components/products/SortSelect';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { EmptyState } from '@/components/common/EmptyState';
import { CardSkeletonList } from '@/components/common/LoadingSpinner';
import { Plus, RefreshCw, Layers, Info, CheckCircle } from 'lucide-react';
import axios from 'axios';

function DashboardContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const { applyOverlayToList, deleteLocalProduct } = useProducts();

  // --- Read URL Parameters with Robust Edge-Case Guards ---
  const urlPageRaw = searchParams.get('page');
  const urlPageSizeRaw = searchParams.get('pageSize');
  const urlQ = searchParams.get('q') || '';
  const urlCategory = searchParams.get('category') || '';
  const urlSortBy = searchParams.get('sortBy') || '';
  const urlOrderRaw = searchParams.get('order');

  // Guard against NaN, negative, or invalid numeric params (?page=abc, ?page=-1, etc.)
  const parsedPage = parseInt(urlPageRaw || '1', 10);
  const safePage = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;

  const parsedPageSize = parseInt(urlPageSizeRaw || '10', 10);
  const safePageSize = [10, 20, 50].includes(parsedPageSize) ? parsedPageSize : 10;

  const safeOrder = urlOrderRaw === 'desc' ? 'desc' : 'asc';

  // --- Local States ---
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Search input state (debounced)
  const [searchInput, setSearchInput] = useState<string>(urlQ);
  const debouncedSearch = useDebounce(searchInput, 400);

  // Delete modal state
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  /**
   * Stale Response Guard:
   * Incremental request counter to prevent race conditions.
   * If request A (e.g. slow keystroke with &delay=2000) resolves AFTER request B (fast keystroke),
   * request A will compare its ID against latestRequestIdRef.current and discard its payload.
   */
  const latestRequestIdRef = useRef<number>(0);

  // Synchronize search input if URL changes externally (e.g., browser back/forward)
  useEffect(() => {
    if (urlQ !== searchInput && urlQ !== debouncedSearch) {
      setSearchInput(urlQ);
    }
  }, [urlQ]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch Category List on Mount
  useEffect(() => {
    let isMounted = true;
    async function loadCategories() {
      try {
        const catList = await getCategories();
        if (isMounted) {
          setCategories(catList);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Helper function to update URL search parameters shallowly via router.replace
   */
  const updateUrlParams = useCallback(
    (newParams: Record<string, string | number | null | undefined>) => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));

      Object.entries(newParams).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '' || (key === 'page' && value === 1)) {
          current.delete(key);
        } else {
          current.set(key, String(value));
        }
      });

      // Maintain default pageSize if 10 to keep URL clean
      if (current.get('pageSize') === '10') {
        current.delete('pageSize');
      }

      // Maintain default order if asc and no sortBy
      if (!current.get('sortBy')) {
        current.delete('order');
      }

      const query = current.toString();
      const newUrl = query ? `${pathname}?${query}` : pathname;

      startTransition(() => {
        router.replace(newUrl, { scroll: false });
      });
    },
    [searchParams, pathname, router]
  );

  /**
   * When debounced search changes, sync it to the URL and reset to page 1.
   * Also enforces mutual exclusivity: searching text automatically clears active category.
   */
  useEffect(() => {
    if (debouncedSearch !== urlQ) {
      updateUrlParams({
        q: debouncedSearch || null,
        category: debouncedSearch ? null : urlCategory, // Search beats category
        page: 1, // Always reset to page 1 on search change
      });
    }
  }, [debouncedSearch, urlQ, urlCategory, updateUrlParams]);

  /**
   * Primary Data Fetcher:
   * Triggered whenever URL search parameters change.
   * Employs stale response guard to ensure out-of-order API responses are ignored.
   */
  const loadProducts = useCallback(async () => {
    const requestId = ++latestRequestIdRef.current;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await fetchProducts({
        page: safePage,
        pageSize: safePageSize,
        q: urlQ,
        category: urlCategory,
        sortBy: urlSortBy || undefined,
        order: urlSortBy ? safeOrder : undefined,
      });

      // Stale Response Guard check: Ignore if a newer request was dispatched
      if (requestId !== latestRequestIdRef.current) {
        return;
      }

      // Merge remote data with local persistence overlay (added/updated/deleted items)
      const merged = applyOverlayToList(data.products, data.total, urlCategory, urlQ);

      // Handle edge case: ?page=999 beyond max page range
      const maxPages = Math.max(1, Math.ceil(merged.total / safePageSize));
      if (safePage > maxPages && merged.total > 0) {
        updateUrlParams({ page: maxPages });
        return;
      }

      setProducts(merged.products);
      setTotal(merged.total);
    } catch (err: unknown) {
      if (requestId !== latestRequestIdRef.current) return;

      if (axios.isAxiosError(err)) {
        setErrorMessage(
          err.response?.data?.message || 'Failed to fetch products from DummyJSON API.'
        );
      } else {
        setErrorMessage('An unexpected error occurred while loading products.');
      }
    } finally {
      if (requestId === latestRequestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [
    safePage,
    safePageSize,
    urlQ,
    urlCategory,
    urlSortBy,
    safeOrder,
    applyOverlayToList,
    updateUrlParams,
  ]);

  // Trigger loadProducts whenever parameters change
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // --- Filter Handlers (All write directly to URL) ---

  const handleCategoryChange = (slug: string) => {
    // Mutual exclusivity: selecting a category clears active search
    setSearchInput('');
    updateUrlParams({
      category: slug || null,
      q: null, // Clear search
      page: 1, // Reset to page 1
    });
  };

  const handleSortChange = (newSortBy: string, newOrder: 'asc' | 'desc') => {
    updateUrlParams({
      sortBy: newSortBy || null,
      order: newSortBy ? newOrder : null,
      page: 1,
    });
  };

  const handlePageChange = (newPage: number) => {
    updateUrlParams({ page: newPage });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    updateUrlParams({ pageSize: newPageSize, page: 1 });
  };

  const handleResetFilters = () => {
    setSearchInput('');
    updateUrlParams({
      q: null,
      category: null,
      sortBy: null,
      order: null,
      page: 1,
    });
  };

  // --- Delete Handling ---
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    try {
      await deleteProduct(productToDelete.id);

      // Record deletion in local overlay so product disappears for this session
      deleteLocalProduct(productToDelete.id);

      // Optimistically update local list
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      setTotal((prev) => Math.max(0, prev - 1));

      setToastMessage(`Product "${productToDelete.title}" was deleted.`);
      setTimeout(() => setToastMessage(null), 4000);
      setProductToDelete(null);
    } catch (err) {
      console.error('Failed to delete product:', err);
      alert('Failed to delete product. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl border border-slate-700 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* Header Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-indigo-600" />
            Product Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage inventory items, filter by category, sort attributes, and test live queries
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => loadProducts()}
            disabled={isLoading}
            title="Refresh list"
            className="inline-flex items-center px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-sm transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            href="/dashboard/products/new"
            className="inline-flex items-center px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 transition-all"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add New Product
          </Link>
        </div>
      </div>

      {/* Explanatory Info Card: Search vs Category Tradeoff */}
      <div className="rounded-xl bg-indigo-50/70 border border-indigo-100 p-3.5 flex items-start gap-2.5 text-xs text-indigo-900 shadow-sm">
        <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-semibold">DummyJSON Search/Category Separation:</span> The public
          DummyJSON API separates search (`/products/search?q=`) and category filtering
          (`/products/category/:slug`) into distinct endpoints. Choosing a category clears any active
          search text, and typing a search resets the category filter.
        </div>
      </div>

      {/* Search, Filter & Sort Controls Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Debounced Search Bar */}
          <SearchBar
            value={searchInput}
            onChange={(val) => setSearchInput(val)}
            isLoading={isLoading && debouncedSearch !== urlQ}
            hasActiveCategory={!!urlCategory}
          />

          {/* Filters & Sorting Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <CategoryFilter
              categories={categories}
              selectedCategory={urlCategory}
              onCategoryChange={handleCategoryChange}
              isLoading={isLoading}
              hasActiveSearch={!!urlQ}
            />

            <SortSelect
              sortBy={urlSortBy}
              order={safeOrder}
              onSortChange={handleSortChange}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {errorMessage ? (
        <ErrorAlert
          message={errorMessage}
          onRetry={loadProducts}
          isRetrying={isLoading}
        />
      ) : products.length === 0 && !isLoading ? (
        <EmptyState
          title="No matching products found"
          description={
            urlQ
              ? `No products found matching "${urlQ}". Try a different keyword or reset filters.`
              : urlCategory
              ? `No products found in category "${urlCategory}".`
              : 'Your product list is currently empty.'
          }
          onReset={handleResetFilters}
        />
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <ProductTable
            products={products}
            isLoading={isLoading}
            onDeleteClick={(p) => setProductToDelete(p)}
          />

          {/* Mobile Card View (< md) */}
          <div className="md:hidden">
            {isLoading ? (
              <CardSkeletonList count={safePageSize} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onDeleteClick={(p) => setProductToDelete(p)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Hand-crafted Pagination */}
          <Pagination
            currentPage={safePage}
            pageSize={safePageSize}
            total={total}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            isLoading={isLoading}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!productToDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${productToDelete?.title}"? Note: Since DummyJSON mutation is simulated, this product will be removed from your local session view.`}
        confirmLabel="Confirm Delete"
        cancelLabel="Cancel"
        isConfirming={isDeleting}
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setProductToDelete(null)}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-10 bg-slate-200 rounded-xl animate-pulse w-1/3" />
          <div className="h-16 bg-slate-200 rounded-2xl animate-pulse" />
          <CardSkeletonList count={6} />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
