'use client';

/**
 * ProductsContext — client-side overlay for add/edit/delete operations.
 *
 * WHY THIS EXISTS:
 * DummyJSON's /products/add, PUT /products/{id}, and DELETE /products/{id}
 * endpoints return realistic success responses but do NOT actually persist data
 * server-side. The next GET /products call will return the original unmodified data.
 *
 * APPROACH:
 * This context maintains three in-memory overlays that are applied on top of any
 * API-fetched product list before rendering:
 *   - `localAdded`   — products added this session (prepended to list)
 *   - `localEdited`  — a map of id → updated fields (merged into matching products)
 *   - `localDeleted` — a set of deleted product IDs (filtered out of list)
 *
 * The overlays are persisted to sessionStorage so they survive a same-tab page
 * refresh but are cleared when the browser tab is closed.
 *
 * `mergeWithApiData(apiProducts)` is the main helper — call it after every
 * successful API fetch to apply the local overrides before rendering.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { Product, ProductFormData } from '@/services/products';
import {
  addProduct as apiAdd,
  updateProduct as apiUpdate,
  deleteProduct as apiDelete,
} from '@/services/products';

// ── Storage helpers ───────────────────────────────────────────────────────────

const SESSION_KEY = 'product_admin_overlay';

interface Overlay {
  localAdded: Product[];
  localEdited: Record<number, Partial<Product>>;
  localDeleted: number[];
}

function loadOverlay(): Overlay {
  if (typeof window === 'undefined') return { localAdded: [], localEdited: {}, localDeleted: [] };
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { localAdded: [], localEdited: {}, localDeleted: [] };
}

function saveOverlay(overlay: Overlay) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(overlay));
  } catch {}
}

// ── Context ───────────────────────────────────────────────────────────────────

interface ProductsContextValue {
  localAdded: Product[];
  localEdited: Record<number, Partial<Product>>;
  localDeleted: number[];
  /** Apply local overlays on top of API data before rendering. */
  mergeWithApiData: (apiProducts: Product[]) => Product[];
  /** Call after a successful POST /products/add */
  handleAdd: (data: ProductFormData) => Promise<Product>;
  /** Call after a successful PUT /products/{id} */
  handleEdit: (id: number, data: Partial<ProductFormData>) => Promise<Product>;
  /** Call after a successful DELETE /products/{id} */
  handleDelete: (id: number) => Promise<void>;
  /** Get a single product (checks local overlay first) */
  getLocalProduct: (id: number) => Partial<Product> | null;
}

const ProductsContext = createContext<ProductsContextValue | null>(null);

let nextLocalId = -1; // negative IDs for locally-added products

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [overlay, setOverlay] = useState<Overlay>(() => loadOverlay());

  // Persist overlay to sessionStorage whenever it changes
  useEffect(() => {
    saveOverlay(overlay);
  }, [overlay]);

  const mergeWithApiData = useCallback(
    (apiProducts: Product[]): Product[] => {
      // 1. Filter out deleted products
      const filtered = apiProducts.filter((p) => !overlay.localDeleted.includes(p.id));

      // 2. Apply edits to existing products
      const edited = filtered.map((p) => {
        const patch = overlay.localEdited[p.id];
        return patch ? { ...p, ...patch } : p;
      });

      // 3. Prepend locally-added products (also apply any edits to them)
      const addedVisible = overlay.localAdded
        .filter((p) => !overlay.localDeleted.includes(p.id))
        .map((p) => {
          const patch = overlay.localEdited[p.id];
          return patch ? { ...p, ...patch } : p;
        });

      return [...addedVisible, ...edited];
    },
    [overlay]
  );

  const handleAdd = useCallback(async (data: ProductFormData): Promise<Product> => {
    const apiResult = await apiAdd(data);
    // DummyJSON returns id=121 for every add — assign a unique negative ID locally
    const localId = nextLocalId--;
    const newProduct: Product = {
      ...apiResult,
      ...data,
      id: localId,
      rating: 0,
      discountPercentage: 0,
      tags: [],
      sku: '',
      weight: 0,
      dimensions: { width: 0, height: 0, depth: 0 },
      warrantyInformation: '',
      shippingInformation: '',
      availabilityStatus: 'In Stock',
      reviews: [],
      returnPolicy: '',
      minimumOrderQuantity: 1,
      meta: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), barcode: '', qrCode: '' },
      images: [data.thumbnail],
    };

    setOverlay((prev) => ({
      ...prev,
      localAdded: [newProduct, ...prev.localAdded],
    }));

    return newProduct;
  }, []);

  const handleEdit = useCallback(
    async (id: number, data: Partial<ProductFormData>): Promise<Product> => {
      const apiResult = await apiUpdate(id, data);

      setOverlay((prev) => ({
        ...prev,
        localEdited: {
          ...prev.localEdited,
          [id]: { ...(prev.localEdited[id] ?? {}), ...data },
        },
      }));

      // For locally-added products (negative IDs), apiResult may not be meaningful
      // Find the product from localAdded if needed
      const localAdded = overlay.localAdded.find((p) => p.id === id);
      if (localAdded) {
        return { ...localAdded, ...data };
      }

      return { ...apiResult, ...data };
    },
    [overlay.localAdded]
  );

  const handleDelete = useCallback(async (id: number): Promise<void> => {
    // Only call the API for real (positive) IDs
    if (id > 0) {
      await apiDelete(id);
    }
    setOverlay((prev) => ({
      ...prev,
      localDeleted: [...prev.localDeleted, id],
    }));
  }, []);

  const getLocalProduct = useCallback(
    (id: number): Partial<Product> | null => {
      // Check locally added first
      const added = overlay.localAdded.find((p) => p.id === id);
      if (added) {
        const patch = overlay.localEdited[id];
        return patch ? { ...added, ...patch } : added;
      }
      // Check edits
      return overlay.localEdited[id] ?? null;
    },
    [overlay]
  );

  const value: ProductsContextValue = {
    localAdded: overlay.localAdded,
    localEdited: overlay.localEdited,
    localDeleted: overlay.localDeleted,
    mergeWithApiData,
    handleAdd,
    handleEdit,
    handleDelete,
    getLocalProduct,
  };

  return (
    <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
  );
}

export function useProducts(): ProductsContextValue {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProducts must be used inside <ProductsProvider>');
  return ctx;
}
