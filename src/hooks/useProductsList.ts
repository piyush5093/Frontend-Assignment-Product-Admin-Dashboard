import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Product,
  ProductsResponse,
  SortField,
  SortOrder,
  getProducts,
  searchProducts,
  getProductsByCategory,
} from '@/services/products';
import { useProducts } from '@/context/ProductsContext';

export interface UseProductsListParams {
  page: number;
  limit: number;
  q: string;
  category: string;
  sortBy: SortField | '';
  order: SortOrder;
}

export interface UseProductsListResult {
  products: Product[];
  total: number;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

/**
 * useProductsList — fetches and manages the product list with:
 *  - Pagination (limit/skip derived from page)
 *  - Search (q) via /products/search
 *  - Category filter via /products/category/<name>
 *  - Sorting (sortBy, order)
 *  - Race-condition prevention via AbortController
 *    (a new request aborts any previous in-flight request)
 *  - Integration with ProductsContext for local add/edit/delete overlay
 *
 * NOTE: Search and category cannot be combined (DummyJSON limitation).
 * When q is non-empty, category is ignored (and vice-versa).
 */
export function useProductsList(params: UseProductsListParams): UseProductsListResult {
  const { page, limit, q, category, sortBy, order } = params;
  const { mergeWithApiData } = useProducts();

  const [rawProducts, setRawProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Used to trigger a retry — incrementing this causes the useEffect to re-run.
  const [retryCount, setRetryCount] = useState(0);

  // AbortController ref — holds the controller for the most recent request.
  // We use a ref (not state) to avoid triggering re-renders.
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchProducts = useCallback(async () => {
    // Abort any previous in-flight request before starting a new one.
    // This prevents race conditions where a slow older response overwrites
    // a faster newer response.
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    const skip = (page - 1) * limit;
    const commonParams = {
      limit,
      skip,
      sortBy: sortBy || undefined,
      order: sortBy ? order : undefined,
      signal: controller.signal,
    };

    try {
      let result: ProductsResponse;

      if (q.trim()) {
        // Search mode — category filter is ignored
        result = await searchProducts({ ...commonParams, q: q.trim() });
      } else if (category) {
        // Category filter mode — search query is empty
        result = await getProductsByCategory({ ...commonParams, category });
      } else {
        // Default list
        result = await getProducts(commonParams);
      }

      // Only update state if this request was not aborted
      if (!controller.signal.aborted) {
        setRawProducts(result.products);
        setTotal(result.total);
        setError(null);
      }
    } catch (err: unknown) {
      // Ignore errors from aborted requests — they're expected
      if (err instanceof Error && err.name === 'AbortError') return;
      if (err instanceof Error && err.name === 'CanceledError') return;

      if (!controller.signal.aborted) {
        setError(err instanceof Error ? err.message : 'Failed to load products');
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [page, limit, q, category, sortBy, order, retryCount]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchProducts();
    // Cleanup: abort the request if the component unmounts or deps change
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [fetchProducts]);

  // Apply local overlay (add/edit/delete) on top of API results
  const products = mergeWithApiData(rawProducts);

  const retry = useCallback(() => {
    setRetryCount((c) => c + 1);
  }, []);

  return { products, total, loading, error, retry };
}
