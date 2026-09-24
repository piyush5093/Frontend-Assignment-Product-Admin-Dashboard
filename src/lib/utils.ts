/**
 * URL parameter utilities.
 *
 * These helpers sanitise and validate URL search params so that invalid
 * values like ?page=abc or ?page=999 never crash the app.
 */

import { SortField, SortOrder } from '@/services/products';

const VALID_LIMITS = [10, 20, 50] as const;
const VALID_SORT_FIELDS: SortField[] = ['price', 'rating', 'title', 'stock'];
const VALID_ORDERS: SortOrder[] = ['asc', 'desc'];

/**
 * Parse and clamp a page number from a URL param string.
 * Falls back to 1 for any non-positive or non-numeric value.
 * If maxPage is known, clamps to it.
 */
export function parsePage(raw: string | null, maxPage?: number): number {
  const n = parseInt(raw ?? '', 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  if (maxPage !== undefined && n > maxPage) return maxPage;
  return n;
}

/**
 * Parse and validate a page-size limit from a URL param string.
 * Falls back to 10 if the value is not one of the allowed options.
 */
export function parseLimit(raw: string | null): 10 | 20 | 50 {
  const n = parseInt(raw ?? '', 10) as 10 | 20 | 50;
  return VALID_LIMITS.includes(n) ? n : 10;
}

/**
 * Parse and validate a sort field from a URL param string.
 */
export function parseSortBy(raw: string | null): SortField | '' {
  if (raw && VALID_SORT_FIELDS.includes(raw as SortField)) return raw as SortField;
  return '';
}

/**
 * Parse and validate a sort order from a URL param string.
 */
export function parseSortOrder(raw: string | null): SortOrder {
  if (raw && VALID_ORDERS.includes(raw as SortOrder)) return raw as SortOrder;
  return 'asc';
}

/**
 * Format the "Showing X–Y of Z" pagination label.
 */
export function formatPaginationLabel(page: number, limit: number, total: number): string {
  if (total === 0) return 'No results';
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  return `Showing ${start}–${end} of ${total}`;
}

/**
 * Calculate the total number of pages.
 */
export function getTotalPages(total: number, limit: number): number {
  return Math.max(1, Math.ceil(total / limit));
}

/**
 * Format a price as a USD currency string.
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

/**
 * Clamp a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
