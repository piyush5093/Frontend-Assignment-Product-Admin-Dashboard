'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/services/products';
import { formatPrice } from '@/lib/utils';

interface ProductTableProps {
  products: Product[];
  onDelete: (id: number, title: string) => void;
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-sm text-gray-700">
      <svg className="w-3.5 h-3.5 text-amber-400 fill-current" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      {rating.toFixed(1)}
    </span>
  );
}

function StockBadge({ stock }: { stock: number }) {
  const isLow = stock < 10;
  const isOut = stock === 0;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
        isOut
          ? 'bg-red-100 text-red-700'
          : isLow
          ? 'bg-amber-100 text-amber-700'
          : 'bg-green-100 text-green-700'
      }`}
    >
      {isOut ? 'Out of stock' : `${stock} in stock`}
    </span>
  );
}

export default function ProductTable({ products, onDelete }: ProductTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200 text-left">
            <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide w-16">
              Image
            </th>
            <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">
              Title
            </th>
            <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide hidden lg:table-cell">
              Category
            </th>
            <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">
              Price
            </th>
            <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide hidden md:table-cell">
              Rating
            </th>
            <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide hidden md:table-cell">
              Stock
            </th>
            <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {products.map((product) => (
            <tr
              key={product.id}
              className="hover:bg-gray-50 transition-colors group"
            >
              {/* Image */}
              <td className="px-4 py-3">
                <Link href={`/products/${product.id}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.thumbnail}
                    alt={product.title}
                    className="w-12 h-12 object-cover rounded-lg border border-gray-100 group-hover:scale-105 transition-transform"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"%3E%3Crect width="24" height="24" fill="%23f3f4f6"/%3E%3Cpath fill="%239ca3af" d="M4 4h16v16H4z" opacity=".2"/%3E%3C/svg%3E';
                    }}
                  />
                </Link>
              </td>

              {/* Title */}
              <td className="px-4 py-3">
                <Link
                  href={`/products/${product.id}`}
                  className="font-medium text-gray-900 hover:text-indigo-600 transition-colors line-clamp-1"
                >
                  {product.title}
                </Link>
                {product.brand && (
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{product.brand}</p>
                )}
              </td>

              {/* Category */}
              <td className="px-4 py-3 hidden lg:table-cell">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 capitalize">
                  {product.category}
                </span>
              </td>

              {/* Price */}
              <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
                {formatPrice(product.price)}
                {product.discountPercentage > 0 && (
                  <span className="ml-1 text-xs text-green-600 font-normal">
                    -{product.discountPercentage.toFixed(0)}%
                  </span>
                )}
              </td>

              {/* Rating */}
              <td className="px-4 py-3 hidden md:table-cell">
                <RatingStars rating={product.rating} />
              </td>

              {/* Stock */}
              <td className="px-4 py-3 hidden md:table-cell">
                <StockBadge stock={product.stock} />
              </td>

              {/* Actions */}
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1.5">
                  <Link
                    href={`/products/${product.id}`}
                    className="px-2.5 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors border border-transparent hover:border-indigo-100"
                    aria-label={`View ${product.title}`}
                  >
                    View
                  </Link>
                  <Link
                    href={`/products/${product.id}/edit`}
                    className="px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors border border-transparent hover:border-gray-200"
                    aria-label={`Edit ${product.title}`}
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => onDelete(product.id, product.title)}
                    className="px-2.5 py-1 text-xs font-medium text-red-500 hover:bg-red-50 rounded-md transition-colors border border-transparent hover:border-red-100"
                    aria-label={`Delete ${product.title}`}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
