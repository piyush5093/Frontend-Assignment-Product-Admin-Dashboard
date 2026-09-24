import React from 'react';

interface LoaderProps {
  /** Skeleton rows to show (for table skeleton mode) */
  rows?: number;
  mode?: 'spinner' | 'skeleton';
}

export default function Loader({ rows = 5, mode = 'skeleton' }: LoaderProps) {
  if (mode === 'spinner') {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">Loading…</p>
      </div>
    );
  }

  // Skeleton table rows
  return (
    <div className="animate-pulse space-y-3" aria-label="Loading products">
      {/* Desktop skeleton table */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {['Image', 'Title', 'Category', 'Price', 'Rating', 'Stock', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left">
                  <div className="h-3 bg-gray-200 rounded w-16" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={i}>
                <td className="px-4 py-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 bg-gray-200 rounded w-40 mb-1" />
                  <div className="h-3 bg-gray-100 rounded w-24" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-5 bg-gray-200 rounded-full w-20" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 bg-gray-200 rounded w-14" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 bg-gray-200 rounded w-10" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 bg-gray-200 rounded w-10" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <div className="h-7 bg-gray-200 rounded w-12" />
                    <div className="h-7 bg-gray-200 rounded w-14" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile skeleton cards */}
      <div className="md:hidden space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-3">
            <div className="w-16 h-16 bg-gray-200 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
              <div className="h-3 bg-gray-100 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
