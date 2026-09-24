/**
 * Products service — all product-related API calls.
 * Uses the shared axiosInstance (with interceptors).
 *
 * NOTE on Search + Category filter conflict:
 * DummyJSON does not provide a combined endpoint for searching (q=) AND filtering
 * by category. The two relevant endpoints are:
 *   - GET /products/search?q=<query>            (search only)
 *   - GET /products/category/<name>             (category filter only)
 *   - GET /products                             (list all, supports sortBy/order/limit/skip)
 *
 * Decision: When a search query (q) is active, the category filter is disabled in the UI
 * and vice-versa — selecting a category clears the search. This keeps the API usage honest.
 * A small note is shown in the UI when one is disabled due to the other.
 */

import axiosInstance from './axiosInstance';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Review {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
}

export interface Dimensions {
  width: number;
  height: number;
  depth: number;
}

export interface Meta {
  createdAt: string;
  updatedAt: string;
  barcode: string;
  qrCode: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  tags: string[];
  brand: string;
  sku: string;
  weight: number;
  dimensions: Dimensions;
  warrantyInformation: string;
  shippingInformation: string;
  availabilityStatus: string;
  reviews: Review[];
  returnPolicy: string;
  minimumOrderQuantity: number;
  meta: Meta;
  images: string[];
  thumbnail: string;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export interface CategoryItem {
  slug: string;
  name: string;
  url: string;
}

export type SortField = 'price' | 'rating' | 'title' | 'stock';
export type SortOrder = 'asc' | 'desc';

export interface ProductsParams {
  limit?: number;
  skip?: number;
  sortBy?: SortField;
  order?: SortOrder;
  signal?: AbortSignal;
}

export interface SearchParams extends ProductsParams {
  q: string;
}

export interface CategoryParams extends ProductsParams {
  category: string;
}

export type ProductFormData = Pick<
  Product,
  'title' | 'description' | 'price' | 'stock' | 'category' | 'brand' | 'thumbnail'
>;

// ── API functions ─────────────────────────────────────────────────────────────

/**
 * GET /products — fetch all products with optional pagination and sorting.
 */
export async function getProducts(params: ProductsParams = {}): Promise<ProductsResponse> {
  const { limit = 10, skip = 0, sortBy, order, signal } = params;
  const response = await axiosInstance.get<ProductsResponse>('/products', {
    params: { limit, skip, sortBy, order },
    signal,
  });
  return response.data;
}

/**
 * GET /products/search?q= — search products by query.
 * NOTE: Cannot be combined with category filter (DummyJSON limitation).
 */
export async function searchProducts(params: SearchParams): Promise<ProductsResponse> {
  const { q, limit = 10, skip = 0, sortBy, order, signal } = params;
  const response = await axiosInstance.get<ProductsResponse>('/products/search', {
    params: { q, limit, skip, sortBy, order },
    signal,
  });
  return response.data;
}

/**
 * GET /products/category/<name> — filter products by category.
 * NOTE: Cannot be combined with search query (DummyJSON limitation).
 */
export async function getProductsByCategory(params: CategoryParams): Promise<ProductsResponse> {
  const { category, limit = 10, skip = 0, sortBy, order, signal } = params;
  const response = await axiosInstance.get<ProductsResponse>(`/products/category/${encodeURIComponent(category)}`, {
    params: { limit, skip, sortBy, order },
    signal,
  });
  return response.data;
}

/**
 * GET /products/categories — fetch the full list of categories.
 */
export async function getCategories(): Promise<CategoryItem[]> {
  const response = await axiosInstance.get<CategoryItem[]>('/products/categories');
  return response.data;
}

/**
 * GET /products/:id — fetch a single product by ID.
 */
export async function getProductById(id: number | string): Promise<Product> {
  const response = await axiosInstance.get<Product>(`/products/${id}`);
  return response.data;
}

/**
 * POST /products/add — create a new product.
 * NOTE: DummyJSON does not actually persist this — it returns a fake success response.
 * The app maintains a client-side overlay (ProductsContext) to reflect the change in the UI.
 */
export async function addProduct(data: ProductFormData): Promise<Product> {
  const response = await axiosInstance.post<Product>('/products/add', data);
  return response.data;
}

/**
 * PUT /products/:id — update an existing product.
 * NOTE: DummyJSON does not actually persist this — same caveat as addProduct.
 */
export async function updateProduct(id: number | string, data: Partial<ProductFormData>): Promise<Product> {
  const response = await axiosInstance.put<Product>(`/products/${id}`, data);
  return response.data;
}

/**
 * DELETE /products/:id — delete a product.
 * NOTE: DummyJSON does not actually persist this — same caveat as addProduct.
 */
export async function deleteProduct(id: number | string): Promise<{ id: number; isDeleted: boolean; deletedOn: string }> {
  const response = await axiosInstance.delete(`/products/${id}`);
  return response.data;
}
