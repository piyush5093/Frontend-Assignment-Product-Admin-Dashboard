'use client';

import React from 'react';
import RouteGuard from '@/components/layout/RouteGuard';
import ProductForm from '@/components/products/ProductForm';

export default function AddProductPage() {
  return (
    <RouteGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="text-sm text-gray-500 mb-6 flex items-center gap-1.5">
          <a href="/products" className="hover:text-indigo-600 transition-colors">Products</a>
          <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-900 font-medium">Add Product</span>
        </nav>

        <ProductForm />
      </div>
    </RouteGuard>
  );
}
