'use client';

import React from 'react';
import { formatPaginationLabel, getTotalPages, clamp } from '@/lib/utils';

interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: 10 | 20 | 50) => void;
}

const PAGE_SIZE_OPTIONS: (10 | 20 | 50)[] = [10, 20, 50];

export default function Pagination({
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
}: PaginationProps) {
  const totalPages = getTotalPages(total, limit);
  const label = formatPaginationLabel(page, limit, total);

  // Generate page number buttons: show at most 5 page buttons around the current page.
  const getPageNumbers = (): (number | '...')[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | '...')[] = [1];
    const start = clamp(page - 2, 2, totalPages - 3);
    const end = clamp(page + 2, 4, totalPages - 1);

    if (start > 2) pages.push('...');
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push('...');
    pages.push(totalPages);

    return pages;
  };

  const pageNumbers = getPageNumbers();

  const btnBase =
    'inline-flex items-center justify-center h-8 min-w-[2rem] px-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 disabled:opacity-40 disabled:cursor-not-allowed';

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-1 py-3">
      {/* Left: label + page size */}
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <span className="whitespace-nowrap">{label}</span>
        <label className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-gray-500 hidden sm:inline">Rows:</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value) as 10 | 20 | 50)}
            className="border border-gray-300 rounded-md text-sm px-2 py-1 text-gray-700
              focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            aria-label="Page size"
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Right: page navigation */}
      <div className="flex items-center gap-1" role="navigation" aria-label="Pagination">
        {/* Previous */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className={`${btnBase} gap-1 text-gray-600 hover:bg-gray-100 disabled:hover:bg-transparent`}
          aria-label="Previous page"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Page numbers */}
        {pageNumbers.map((p, i) =>
          p === '...' ? (
            <span
              key={`ellipsis-${i}`}
              className="inline-flex items-center justify-center h-8 w-8 text-sm text-gray-400"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              disabled={p === page}
              aria-current={p === page ? 'page' : undefined}
              className={`${btnBase} ${
                p === page
                  ? 'bg-indigo-600 text-white cursor-default'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {p}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className={`${btnBase} gap-1 text-gray-600 hover:bg-gray-100 disabled:hover:bg-transparent`}
          aria-label="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
