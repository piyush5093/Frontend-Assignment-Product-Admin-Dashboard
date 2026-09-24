import React from 'react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  onClearFilters?: () => void;
}

export default function EmptyState({
  title = 'No products found',
  message = 'Try adjusting your search or filters.',
  onClearFilters,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mb-4">
        <svg
          className="w-8 h-8 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <h3 className="text-gray-900 font-semibold text-lg mb-1">{title}</h3>
      <p className="text-gray-500 text-sm max-w-sm">{message}</p>
      {onClearFilters && (
        <button
          onClick={onClearFilters}
          className="mt-5 px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700
            border border-indigo-200 hover:border-indigo-300 rounded-lg bg-indigo-50 hover:bg-indigo-100
            transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
