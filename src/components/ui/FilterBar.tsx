'use client';

import React from 'react';
import { CategoryItem } from '@/services/products';

interface FilterBarProps {
  categories: CategoryItem[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  /** Disable the category filter when search is active (API limitation) */
  disabled?: boolean;
  loading?: boolean;
}

/**
 * FilterBar — category dropdown filter.
 *
 * IMPORTANT: DummyJSON does not support combining a search query (q=) and a
 * category filter in the same request. When the search bar has a value, this
 * component is disabled and shows an explanatory note.
 */
export default function FilterBar({
  categories,
  selectedCategory,
  onCategoryChange,
  disabled = false,
  loading = false,
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <label htmlFor="category-filter" className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        Category
      </label>
      <div className="relative">
        <select
          id="category-filter"
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          disabled={disabled || loading}
          title={disabled ? 'Category filter is disabled while a search query is active' : undefined}
          className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm
            text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500
            disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {categories.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Contextual note when disabled by active search */}
      {disabled && (
        <p className="text-xs text-amber-600 flex items-center gap-1">
          <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Disabled while searching
        </p>
      )}
    </div>
  );
}
