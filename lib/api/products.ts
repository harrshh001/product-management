import { apiClient } from './client';
import { Product, ProductListResponse, Category, FetchProductsParams, ProductFormData } from './types';

/**
 * Unified fetchProducts function:
 * Picks the appropriate DummyJSON endpoint based on parameters:
 * 1. If `q` (search query) is present -> calls `/products/search?q=...`
 * 2. Else if `category` is present -> calls `/products/category/{slug}`
 * 3. Else -> calls standard `/products`
 *
 * All three endpoints accept limit, skip, sortBy, and order parameters and
 * return the exact same { products, total, skip, limit } response shape.
 */
export async function fetchProducts(params: FetchProductsParams = {}): Promise<ProductListResponse> {
  const {
    page = 1,
    pageSize = 10,
    q,
    category,
    sortBy,
    order,
    delay,
  } = params;

  // Validate and sanitize pagination values
  const safePage = Math.max(1, isNaN(Number(page)) ? 1 : Number(page));
  const safePageSize = Math.max(1, isNaN(Number(pageSize)) ? 10 : Number(pageSize));
  const skip = (safePage - 1) * safePageSize;

  // Build query params dictionary
  const queryParams: Record<string, string | number> = {
    limit: safePageSize,
    skip: skip,
  };

  if (sortBy) {
    queryParams.sortBy = sortBy;
    if (order) {
      queryParams.order = order;
    }
  }

  // Optional test delay parameter to verify stale-response and race conditions
  if (delay && delay > 0) {
    queryParams.delay = delay;
  }

  let endpoint = '/products';

  // Rule: Search query takes precedence over category.
  // DummyJSON cannot combine ?q= and category filtering in a single endpoint.
  if (q && q.trim().length > 0) {
    endpoint = '/products/search';
    queryParams.q = q.trim();
  } else if (category && category.trim().length > 0 && category !== 'all') {
    endpoint = `/products/category/${encodeURIComponent(category.trim())}`;
  }

  const response = await apiClient.get<ProductListResponse>(endpoint, {
    params: queryParams,
  });

  return response.data;
}

/**
 * Fetch list of all product categories.
 * Returns array of { slug, name, url }.
 */
export async function getCategories(): Promise<Category[]> {
  const response = await apiClient.get<Category[]>('/products/categories');
  return response.data;
}

/**
 * Fetch a single product by ID.
 * Returns full product details including images and reviews.
 */
export async function getProductById(id: number | string): Promise<Product> {
  const response = await apiClient.get<Product>(`/products/${id}`);
  return response.data;
}

/**
 * Add a new product (POST /products/add).
 * Note: DummyJSON does not persist this server-side. It echoes back the created object with a new id.
 */
export async function addProduct(data: ProductFormData): Promise<Product> {
  const response = await apiClient.post<Product>('/products/add', data);
  return response.data;
}

/**
 * Update an existing product (PUT /products/{id}).
 * Note: DummyJSON does not persist this server-side. It echoes back the updated record.
 */
export async function updateProduct(id: number | string, data: Partial<ProductFormData>): Promise<Product> {
  const response = await apiClient.put<Product>(`/products/${id}`, data);
  return response.data;
}

/**
 * Delete a product (DELETE /products/{id}).
 * Note: DummyJSON does not persist this server-side. It returns { id, isDeleted: true, ... }.
 */
export async function deleteProduct(id: number | string): Promise<{ id: number; isDeleted: boolean; deletedOn: string }> {
  const response = await apiClient.delete<{ id: number; isDeleted: boolean; deletedOn: string }>(`/products/${id}`);
  return response.data;
}
