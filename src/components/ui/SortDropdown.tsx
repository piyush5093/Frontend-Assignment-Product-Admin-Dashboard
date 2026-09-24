'use client';

import React from 'react';
import { SortField, SortOrder } from '@/services/products';

interface SortOption {
  label: string;
  sortBy: SortField;
  order: SortOrder;
}

const SORT_OPTIONS: SortOption[] = [
  { label: 'Price: Low → High', sortBy: 'price', order: 'asc' },
  { label: 'Price: High → Low', sortBy: 'price', order: 'desc' },
  { label: 'Rating: Best first', sortBy: 'rating', order: 'desc' },
  { label: 'Rating: Worst first', sortBy: 'rating', order: 'asc' },
  { label: 'Title: A → Z', sortBy: 'title', order: 'asc' },
  { label: 'Title: Z → A', sortBy: 'title', order: 'desc' },
];

interface SortDropdownProps {
  sortBy: SortField | '';
  order: SortOrder;
  onSortChange: (sortBy: SortField | '', order: SortOrder) => void;
}

export default function SortDropdown({ sortBy, order, onSortChange }: SortDropdownProps) {
  const currentValue = sortBy ? `${sortBy}-${order}` : '';

  const handleChange = (value: string) => {
    if (!value) {
      onSortChange('', 'asc');
      return;
    }
    const found = SORT_OPTIONS.find((o) => `${o.sortBy}-${o.order}` === value);
    if (found) onSortChange(found.sortBy, found.order);
  };

  return (
    <div className="flex flex-col gap-1 min-w-0">
      <label htmlFor="sort-dropdown" className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        Sort by
      </label>
      <div className="relative">
        <select
          id="sort-dropdown"
          value={currentValue}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm
            text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          aria-label="Sort products"
        >
          <option value="">Default order</option>
          {SORT_OPTIONS.map((o) => (
            <option key={`${o.sortBy}-${o.order}`} value={`${o.sortBy}-${o.order}`}>
              {o.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
