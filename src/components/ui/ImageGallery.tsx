'use client';

import React, { useState } from 'react';

interface ImageGalleryProps {
  images: string[];
  title: string;
}

export default function ImageGallery({ images, title }: ImageGalleryProps) {
  const [selected, setSelected] = useState(0);
  const validImages = images.filter(Boolean);

  if (validImages.length === 0) {
    return (
      <div className="w-full aspect-square bg-gray-100 rounded-2xl flex items-center justify-center">
        <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  const safeIndex = Math.min(selected, validImages.length - 1);

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative w-full aspect-square bg-gray-100 rounded-2xl overflow-hidden border border-gray-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={validImages[safeIndex]}
          alt={`${title} — image ${safeIndex + 1}`}
          className="w-full h-full object-contain p-2"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 24 24"%3E%3Crect width="24" height="24" fill="%23f3f4f6"/%3E%3C/svg%3E';
          }}
        />

        {/* Prev/Next arrows (only if multiple images) */}
        {validImages.length > 1 && (
          <>
            <button
              onClick={() => setSelected((i) => Math.max(0, i - 1))}
              disabled={safeIndex === 0}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white
                border border-gray-200 rounded-full p-1.5 shadow-sm transition-all
                disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Previous image"
            >
              <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setSelected((i) => Math.min(validImages.length - 1, i + 1))}
              disabled={safeIndex === validImages.length - 1}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white
                border border-gray-200 rounded-full p-1.5 shadow-sm transition-all
                disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Next image"
            >
              <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Counter badge */}
        {validImages.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
            {safeIndex + 1} / {validImages.length}
          </div>
        )}
      </div>

      {/* Thumbnails strip */}
      {validImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {validImages.map((src, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden transition-all ${
                i === safeIndex
                  ? 'border-indigo-500 ring-1 ring-indigo-300'
                  : 'border-gray-200 hover:border-indigo-300'
              }`}
              aria-label={`View image ${i + 1}`}
              aria-pressed={i === safeIndex}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`${title} thumbnail ${i + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24"%3E%3Crect width="24" height="24" fill="%23f3f4f6"/%3E%3C/svg%3E';
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
