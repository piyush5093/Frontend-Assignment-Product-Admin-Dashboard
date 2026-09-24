'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/services/products';
import { formatPrice } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onDelete: (id: number, title: string) => void;
}

export default function ProductCard({ product, onDelete }: ProductCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="flex gap-3 p-4">
        {/* Thumbnail */}
        <Link href={`/products/${product.id}`} className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.thumbnail}
            alt={product.title}
            className="w-20 h-20 object-cover rounded-lg border border-gray-100"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24"%3E%3Crect width="24" height="24" fill="%23f3f4f6"/%3E%3C/svg%3E';
            }}
          />
        </Link>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link
                href={`/products/${product.id}`}
                className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-1 block"
              >
                {product.title}
              </Link>
              {product.brand && (
                <p className="text-xs text-gray-400 mt-0.5">{product.brand}</p>
              )}
            </div>
            <span className="shrink-0 font-bold text-gray-900 text-sm">
              {formatPrice(product.price)}
            </span>
          </div>

          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 capitalize">
              {product.category}
            </span>

            {/* Rating */}
            <span className="inline-flex items-center gap-1 text-xs text-gray-600">
              <svg className="w-3 h-3 text-amber-400 fill-current" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {product.rating.toFixed(1)}
            </span>

            {/* Stock */}
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                product.stock === 0
                  ? 'bg-red-100 text-red-700'
                  : product.stock < 10
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-green-100 text-green-700'
              }`}
            >
              {product.stock === 0 ? 'Out of stock' : `${product.stock} in stock`}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            <Link
              href={`/products/${product.id}`}
              className="flex-1 text-center px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50
                rounded-md transition-colors border border-indigo-100"
            >
              View
            </Link>
            <Link
              href={`/products/${product.id}/edit`}
              className="flex-1 text-center px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100
                rounded-md transition-colors border border-gray-200"
            >
              Edit
            </Link>
            <button
              onClick={() => onDelete(product.id, product.title)}
              className="flex-1 text-center px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50
                rounded-md transition-colors border border-red-100"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
