'use client';

/**
 * Products list page (/products)
 *
 * The actual content is in <ProductsContent> which calls useSearchParams().
 * Next.js App Router requires useSearchParams() to be inside a <Suspense>
 * boundary — so the page component wraps it in one.
 *
 * All state (page, limit, q, category, sortBy, order) lives exclusively in URL
 * search params — the URL is the single source of truth. This means refreshing
 * the page or sharing the link preserves the exact view.
 */

import React, { Suspense, useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

import RouteGuard from '@/components/layout/RouteGuard';
import SearchBar from '@/components/ui/SearchBar';
import FilterBar from '@/components/ui/FilterBar';
import SortDropdown from '@/components/ui/SortDropdown';
import Pagination from '@/components/ui/Pagination';
import ProductTable from '@/components/products/ProductTable';
import ProductCard from '@/components/products/ProductCard';
import Loader from '@/components/ui/Loader';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import ConfirmDeleteModal from '@/components/products/ConfirmDeleteModal';

import { useDebounce } from '@/hooks/useDebounce';
import { useProductsList } from '@/hooks/useProductsList';
import { useProducts } from '@/context/ProductsContext';
import { parsePage, parseLimit, parseSortBy, parseSortOrder, getTotalPages } from '@/lib/utils';
import { SortField, SortOrder, CategoryItem, getCategories } from '@/services/products';

// ── Inner component — calls useSearchParams(), must be inside <Suspense> ──────
function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ── Parse URL params ──────────────────────────────────────────────────────
  const rawPage = searchParams.get('page');
  const rawLimit = searchParams.get('limit');
  const rawQ = searchParams.get('q') ?? '';
  const rawCategory = searchParams.get('category') ?? '';
  const rawSortBy = searchParams.get('sortBy');
  const rawOrder = searchParams.get('order');

  const limit = parseLimit(rawLimit);
  const sortBy = parseSortBy(rawSortBy);
  const order = parseSortOrder(rawOrder);
  const category = rawCategory;
  const page = parsePage(rawPage);

  // ── Search input state (local so typing feels instant) ────────────────────
  const [searchInput, setSearchInput] = useState(rawQ);
  const debouncedSearch = useDebounce(searchInput, 450);

  // Sync input when URL changes (e.g. browser back/forward)
  useEffect(() => {
    setSearchInput(rawQ);
  }, [rawQ]);

  // ── Fetch products ────────────────────────────────────────────────────────
  const { products, total, loading, error, retry } = useProductsList({
    page,
    limit,
    q: debouncedSearch,
    // When search is active, skip category (DummyJSON API limitation)
    category: debouncedSearch ? '' : category,
    sortBy,
    order,
  });

  const totalPages = getTotalPages(total, limit);

  // ── Categories for filter dropdown ────────────────────────────────────────
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  // ── Clamp page if out of range after total is known ───────────────────────
  useEffect(() => {
    if (!loading && total > 0 && page > totalPages) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', String(totalPages));
      router.replace(`/products?${params.toString()}`);
    }
  }, [loading, total, page, totalPages]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── URL update helper ─────────────────────────────────────────────────────
  const updateUrl = useCallback(
    (updates: Record<string, string | number | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '') {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });
      router.push(`/products?${params.toString()}`);
    },
    [router, searchParams]
  );

  // ── Event handlers ────────────────────────────────────────────────────────
  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
  }, []);

  // Sync debounced search → URL and reset to page 1
  useEffect(() => {
    const currentQ = searchParams.get('q') ?? '';
    if (debouncedSearch === currentQ) return;
    updateUrl({
      q: debouncedSearch || null,
      page: 1,
      ...(debouncedSearch ? { category: null } : {}),
    });
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePageChange = useCallback(
    (p: number) => updateUrl({ page: p }),
    [updateUrl]
  );

  const handleLimitChange = useCallback(
    (l: 10 | 20 | 50) => updateUrl({ limit: l, page: 1 }),
    [updateUrl]
  );

  const handleCategoryChange = useCallback(
    (cat: string) => {
      setSearchInput('');
      updateUrl({ category: cat || null, q: null, page: 1 });
    },
    [updateUrl]
  );

  const handleSortChange = useCallback(
    (sb: SortField | '', o: SortOrder) =>
      updateUrl({ sortBy: sb || null, order: sb ? o : null, page: 1 }),
    [updateUrl]
  );

  const handleClearFilters = useCallback(() => {
    setSearchInput('');
    router.push('/products');
  }, [router]);

  // ── Delete flow ───────────────────────────────────────────────────────────
  const { handleDelete } = useProducts();
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openDelete = (id: number, title: string) => setDeleteTarget({ id, title });
  const closeDelete = () => !deleting && setDeleteTarget(null);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await handleDelete(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      // keep modal open on error
    } finally {
      setDeleting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  const hasActiveFilters = !!(rawQ || rawCategory || rawSortBy);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          {!loading && total > 0 && (
            <p className="text-sm text-gray-500 mt-0.5">{total} products total</p>
          )}
        </div>
        <Link
          href="/products/add"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700
            text-white text-sm font-semibold rounded-lg transition-colors shadow-sm
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </Link>
      </div>

      {/* Controls bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchBar value={searchInput} onChange={handleSearchChange} />
          </div>
          <div className="flex gap-3 sm:shrink-0">
            <div className="flex-1 sm:w-44">
              <FilterBar
                categories={categories}
                selectedCategory={debouncedSearch ? '' : category}
                onCategoryChange={handleCategoryChange}
                disabled={!!debouncedSearch}
              />
            </div>
            <div className="flex-1 sm:w-52">
              <SortDropdown sortBy={sortBy} order={order} onSortChange={handleSortChange} />
            </div>
          </div>
        </div>
      </div>

      {/* Results area */}
      {loading ? (
        <Loader rows={limit} />
      ) : error ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <ErrorState message={error} onRetry={retry} />
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <EmptyState
            message={
              hasActiveFilters
                ? 'No products match your current search or filters.'
                : 'No products found.'
            }
            onClearFilters={hasActiveFilters ? handleClearFilters : undefined}
          />
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block">
            <ProductTable products={products} onDelete={openDelete} />
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onDelete={openDelete} />
            ))}
          </div>

          {/* Pagination */}
          <div className="bg-white rounded-xl border border-gray-200 px-4 shadow-sm">
            <Pagination
              page={page}
              limit={limit}
              total={total}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
            />
          </div>
        </>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <ConfirmDeleteModal
          productTitle={deleteTarget.title}
          onConfirm={confirmDelete}
          onCancel={closeDelete}
          loading={deleting}
        />
      )}
    </div>
  );
}

// ── Page export — wraps content in Suspense (required for useSearchParams) ────
export default function ProductsPage() {
  return (
    <RouteGuard>
      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Loader rows={10} />
          </div>
        }
      >
        <ProductsContent />
      </Suspense>
    </RouteGuard>
  );
}
