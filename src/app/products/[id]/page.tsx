'use client';

/**
 * Product detail page (/products/[id])
 *
 * Fetches the product by ID. If the ID is invalid or not found, shows a
 * "Product Not Found" message with a link back to the list.
 *
 * Also checks the local ProductsContext overlay so locally-edited products
 * display the correct updated data.
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

import RouteGuard from '@/components/layout/RouteGuard';
import ImageGallery from '@/components/ui/ImageGallery';
import Loader from '@/components/ui/Loader';
import ErrorState from '@/components/ui/ErrorState';
import ConfirmDeleteModal from '@/components/products/ConfirmDeleteModal';

import { getProductById, Product } from '@/services/products';
import { useProducts } from '@/context/ProductsContext';
import { formatPrice } from '@/lib/utils';

function ReviewCard({
  reviewerName,
  comment,
  rating,
  date,
}: {
  reviewerName: string;
  comment: string;
  rating: number;
  date: string;
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-gray-900 text-sm">{reviewerName}</span>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg
              key={i}
              className={`w-3.5 h-3.5 ${i < rating ? 'text-amber-400 fill-current' : 'text-gray-200 fill-current'}`}
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">{comment}</p>
      <p className="text-xs text-gray-400 mt-2">
        {new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
      </p>
    </div>
  );
}

function ProductNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-3xl mb-6">
        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
      <p className="text-gray-500 text-sm max-w-md mb-6">
        The product you are looking for does not exist or may have been removed.
      </p>
      <Link
        href="/products"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700
          text-white text-sm font-semibold rounded-xl transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Products
      </Link>
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getLocalProduct, handleDelete, localDeleted } = useProducts();

  const idParam = params.id as string;
  const numericId = parseInt(idParam, 10);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const [deleteTarget, setDeleteTarget] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Check if this product was locally deleted
  const isLocallyAdded = numericId < 0;
  const isDeleted = localDeleted.includes(numericId);

  useEffect(() => {
    // If the product was deleted in this session, show not-found
    if (isDeleted) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    // For locally-added products (negative IDs), get from context
    if (isLocallyAdded) {
      const local = getLocalProduct(numericId);
      if (local) {
        setProduct(local as Product);
        setLoading(false);
      } else {
        setNotFound(true);
        setLoading(false);
      }
      return;
    }

    // Invalid ID
    if (!idParam || isNaN(numericId) || numericId <= 0) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    getProductById(numericId)
      .then((data) => {
        // Apply any local edits on top of the API data
        const patch = getLocalProduct(numericId);
        setProduct(patch ? { ...data, ...patch } : data);
        setNotFound(false);
      })
      .catch((err: Error) => {
        if (err.message?.toLowerCase().includes('not found') || err.message?.includes('404')) {
          setNotFound(true);
        } else {
          setError(err.message || 'Failed to load product');
        }
      })
      .finally(() => setLoading(false));
  }, [idParam, numericId, retryCount, isDeleted]); // eslint-disable-line react-hooks/exhaustive-deps

  const confirmDelete = async () => {
    if (!product) return;
    setDeleting(true);
    try {
      await handleDelete(product.id);
      router.push('/products');
    } catch {
      setDeleting(false);
      setDeleteTarget(false);
    }
  };

  return (
    <RouteGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6 flex items-center gap-1.5">
          <Link href="/products" className="hover:text-indigo-600 transition-colors">Products</Link>
          <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-900 font-medium line-clamp-1 max-w-xs">
            {product?.title ?? idParam}
          </span>
        </nav>

        {loading ? (
          <Loader mode="spinner" />
        ) : notFound ? (
          <ProductNotFound />
        ) : error ? (
          <ErrorState message={error} onRetry={() => setRetryCount((c) => c + 1)} />
        ) : product ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left — Image gallery */}
            <div>
              <ImageGallery images={product.images ?? [product.thumbnail]} title={product.title} />
            </div>

            {/* Right — Details */}
            <div className="space-y-6">
              {/* Title + category */}
              <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 capitalize mb-2">
                  {product.category}
                </span>
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">{product.title}</h1>
                {product.brand && (
                  <p className="text-gray-500 text-sm mt-1">by <span className="font-medium text-gray-700">{product.brand}</span></p>
                )}
              </div>

              {/* Price + discount */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-gray-900">{formatPrice(product.price)}</span>
                {product.discountPercentage > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-700">
                    -{product.discountPercentage.toFixed(0)}% off
                  </span>
                )}
              </div>

              {/* Rating + stock */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} className={`w-4 h-4 ${i < Math.round(product.rating) ? 'text-amber-400 fill-current' : 'text-gray-200 fill-current'}`} viewBox="0 0 20 20" aria-hidden="true">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{product.rating.toFixed(1)}</span>
                  <span className="text-sm text-gray-400">({product.reviews?.length ?? 0} reviews)</span>
                </div>

                <div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    product.stock === 0
                      ? 'bg-red-100 text-red-700'
                      : product.stock < 10
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {product.stock === 0 ? 'Out of stock' : `${product.stock} in stock`}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Description</h2>
                <p className="text-gray-600 leading-relaxed text-sm">{product.description}</p>
              </div>

              {/* Details grid */}
              {(product.warrantyInformation || product.shippingInformation || product.returnPolicy) && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {product.warrantyInformation && (
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Warranty</p>
                      <p className="text-xs font-medium text-gray-700">{product.warrantyInformation}</p>
                    </div>
                  )}
                  {product.shippingInformation && (
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Shipping</p>
                      <p className="text-xs font-medium text-gray-700">{product.shippingInformation}</p>
                    </div>
                  )}
                  {product.returnPolicy && (
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Returns</p>
                      <p className="text-xs font-medium text-gray-700">{product.returnPolicy}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <Link
                  href={`/products/${product.id}/edit`}
                  className="flex-1 text-center px-4 py-2.5 text-sm font-semibold text-indigo-600
                    border border-indigo-200 hover:bg-indigo-50 rounded-xl transition-colors"
                >
                  Edit Product
                </Link>
                <button
                  onClick={() => setDeleteTarget(true)}
                  className="flex-1 text-center px-4 py-2.5 text-sm font-semibold text-red-500
                    border border-red-200 hover:bg-red-50 rounded-xl transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Reviews section */}
            {product.reviews && product.reviews.length > 0 && (
              <div className="lg:col-span-2">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Reviews ({product.reviews.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {product.reviews.map((review, i) => (
                    <ReviewCard key={i} {...review} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {deleteTarget && product && (
        <ConfirmDeleteModal
          productTitle={product.title}
          onConfirm={confirmDelete}
          onCancel={() => !deleting && setDeleteTarget(false)}
          loading={deleting}
        />
      )}
    </RouteGuard>
  );
}
