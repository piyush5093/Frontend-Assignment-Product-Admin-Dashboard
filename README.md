# Product Admin Dashboard

A full-featured admin dashboard for managing products, built with **Next.js 14 (App Router)**, **React**, **Tailwind CSS**, and **Axios**, powered by the [DummyJSON API](https://dummyjson.com).

---

## Setup & Run

### Prerequisites
- Node.js 18+
- npm 9+

### Install dependencies
```bash
npm install
```

### Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for production
```bash
npm run build
npm start
```

### Demo credentials
- **Username:** `emilys`
- **Password:** `emilyspass`

---

## Feature Checklist

### Authentication
- [x] Login page at `/login` with username/password fields
- [x] POST to DummyJSON `/auth/login` with Axios
- [x] Success: stores token in `localStorage`, redirects to `/products`
- [x] Failure: shows inline error message
- [x] Route guard (`RouteGuard` component) on all product pages
- [x] Logout button in Navbar clears token and redirects to `/login`
- [x] Submit button disabled while login request is in-flight (prevents double-submit)

### Axios Setup
- [x] Single shared `axiosInstance.ts` with `baseURL = https://dummyjson.com`
- [x] Request interceptor: attaches Bearer token from `localStorage`
- [x] Response interceptor: handles 401 (redirects to login), normalises error messages
- [x] All API calls go through this instance via `services/auth.ts` and `services/products.ts`
- [x] No raw `fetch` or inline `axios` calls anywhere in components

### Product List Page (`/products`)
- [x] Table on desktop (md breakpoint and up)
- [x] Cards on mobile (below md)
- [x] Displays: image, title, category, price, rating, stock
- [x] Pagination: page numbers, Prev/Next, page size (10/20/50), "Showing X–Y of Z"
- [x] All state in URL params (`page`, `limit`, `q`, `category`, `sortBy`, `order`)
- [x] Invalid URL params (non-numeric page, out-of-range page) are clamped to safe defaults

### Search
- [x] Search input with 450ms debounce
- [x] Resets to page 1 on query change
- [x] AbortController race-condition prevention (new request aborts previous)
- [x] Clear search button

### Filter & Sort
- [x] Category dropdown populated from `/products/categories`
- [x] Sort by price, rating, title (asc/desc)
- [x] Category filter disabled when search is active (with explanatory note)

### Product Details (`/products/[id]`)
- [x] Image gallery with thumbnail strip and prev/next arrows
- [x] Full product info: description, price, rating, reviews
- [x] "Product Not Found" page for non-existent IDs
- [x] Applies local edit overlay to show updated data

### Add / Edit / Delete
- [x] Shared `ProductForm` for both Add and Edit
- [x] Inline field validation (required fields, positive price, non-negative integer stock, valid URL)
- [x] Thumbnail URL preview
- [x] Save button disabled while submitting
- [x] Confirm delete modal with product name
- [x] Local client-side overlay reflects changes immediately
- [x] Changes persist within the same session (via `sessionStorage`)

### Loading / Empty / Error States
- [x] Skeleton loader matching table/card layout
- [x] Empty state with "Clear all filters" button
- [x] Error state with "Retry" button

---

## Technical Notes

### Problem Faced & Fix: Race Condition in Search
**Problem:** When the user types quickly, multiple API requests can be in-flight simultaneously. Slower responses from older queries can arrive *after* faster responses from newer queries, causing the UI to show stale/incorrect results.

**Fix:** Every search uses an `AbortController`. When a new search starts, the previous controller is `.abort()`ed before the new request fires. The response handler checks `controller.signal.aborted` and ignores aborted responses. This is implemented in `useProductsList.ts`.

To verify: you can append `&delay=2000` to any API call in `axiosInstance.ts` temporarily and type rapidly in the search box — only the final result will ever be rendered.

### Search + Category Filter Tradeoff
**Problem:** DummyJSON has no single endpoint that accepts both a search query (`q=`) and a category filter. The relevant endpoints are:
- `GET /products/search?q=...` — search only
- `GET /products/category/<name>` — category filter only
- `GET /products` — all products (sortable/pageable)

**Decision:** When a search query is active, the category filter is **disabled** in the UI (grayed out with an explanatory tooltip). Selecting a category clears the active search. This approach:
1. Is honest about the API's capability.
2. Keeps the UI predictable — the user always knows why one control is locked.
3. Prioritises search (more specific) over category (broader).

An alternative would be to fetch all products in the selected category and then filter client-side by the search query — but this would be slow, inaccurate for large datasets, and bypass the API's proper full-text search.

### Add / Edit / Delete Persistence Approach
**Problem:** DummyJSON's mutation endpoints (POST `/products/add`, PUT `/products/:id`, DELETE `/products/:id`) return realistic success responses but **do not actually persist data**. The next `GET /products` call returns the original unmodified dataset.

**Approach:** `ProductsContext` maintains a **client-side overlay** with three buckets:
- `localAdded[]` — products added this session (prepended to the list)
- `localEdited{}` — map of `id → patch` applied on top of API data
- `localDeleted[]` — IDs filtered out of every rendered list

The overlay is stored in `sessionStorage` so it survives same-tab page refreshes but clears when the browser tab is closed (i.e., it's intentionally session-scoped, not permanent). `mergeWithApiData()` is called after every API fetch to apply the overlay before rendering.

Locally-added products get negative IDs (to avoid colliding with real DummyJSON IDs) and are handled entirely client-side (they're not sent to the API for subsequent detail/edit fetches).

### AI Tools Used
AI assistance (Antigravity / Gemini) was used to:
- Generate boilerplate for the shared Axios interceptor setup
- Draft the ProductForm validation logic
- Generate Tailwind class combinations for the responsive layout
- Suggest the AbortController pattern for race condition handling

All architectural decisions (URL-as-state, local overlay approach, search vs category tradeoff) were designed and reviewed manually.
