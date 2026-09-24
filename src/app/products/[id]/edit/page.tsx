'use client';

/**
 * Edit product page (/products/[id]/edit)
 *
 * Fetches the product (checking local overlay first), then renders
 * the shared ProductForm in edit mode.
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import RouteGuard from '@/components/layout/RouteGuard';
import ProductForm from '@/components/products/ProductForm';
import Loader from '@/components/ui/Loader';
import ErrorState from '@/components/ui/ErrorState';

import { getProductById, Product } from '@/services/products';
import { useProducts } from '@/context/ProductsContext';

function ProductNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
      <p className="text-gray-500 text-sm mb-6">Cannot edit a product that does not exist.</p>
      <Link
        href="/products"
        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
      >
        Back to Products
      </Link>
    </div>
  );
}

export default function EditProductPage() {
  const params = useParams();
  const { getLocalProduct } = useProducts();

  const idParam = params.id as string;
  const numericId = parseInt(idParam, 10);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!idParam || isNaN(numericId)) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    // For locally-added products (negative IDs)
    if (numericId < 0) {
      const local = getLocalProduct(numericId);
      if (local) {
        setProduct(local as Product);
      } else {
        setNotFound(true);
      }
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    getProductById(numericId)
      .then((data) => {
        // Merge any local edits
        const patch = getLocalProduct(numericId);
        setProduct(patch ? { ...data, ...patch } : data);
        setNotFound(false);
      })
      .catch((err: Error) => {
        if (err.message?.toLowerCase().includes('not found') || err.message?.includes('404')) {
          setNotFound(true);
        } else {
          setError(err.message);
        }
      })
      .finally(() => setLoading(false));
  }, [idParam, numericId, retryCount]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <RouteGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6 flex items-center gap-1.5">
          <Link href="/products" className="hover:text-indigo-600 transition-colors">Products</Link>
          <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          {product && (
            <>
              <Link
                href={`/products/${numericId}`}
                className="hover:text-indigo-600 transition-colors line-clamp-1 max-w-xs"
              >
                {product.title}
              </Link>
              <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </>
          )}
          <span className="text-gray-900 font-medium">Edit</span>
        </nav>

        {loading ? (
          <Loader mode="spinner" />
        ) : notFound ? (
          <ProductNotFound />
        ) : error ? (
          <ErrorState message={error} onRetry={() => setRetryCount((c) => c + 1)} />
        ) : product ? (
          <ProductForm product={product} />
        ) : null}
      </div>
    </RouteGuard>
  );
}
