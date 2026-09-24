'use client';

import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Product, ProductFormData } from '@/services/products';
import { useProducts } from '@/context/ProductsContext';

interface FormErrors {
  title?: string;
  description?: string;
  price?: string;
  stock?: string;
  category?: string;
  brand?: string;
  thumbnail?: string;
}

interface ProductFormProps {
  /** If provided, the form is in "Edit" mode; otherwise "Add" mode */
  product?: Product;
}

function validateForm(data: Partial<ProductFormData>): FormErrors {
  const errors: FormErrors = {};

  if (!data.title?.trim()) errors.title = 'Title is required';
  else if (data.title.trim().length < 3) errors.title = 'Title must be at least 3 characters';

  if (!data.description?.trim()) errors.description = 'Description is required';

  if (data.price === undefined || data.price === null || data.price === ('' as unknown as number)) {
    errors.price = 'Price is required';
  } else if (isNaN(Number(data.price)) || Number(data.price) <= 0) {
    errors.price = 'Price must be a positive number';
  }

  if (data.stock === undefined || data.stock === null || data.stock === ('' as unknown as number)) {
    errors.stock = 'Stock is required';
  } else if (!Number.isInteger(Number(data.stock)) || Number(data.stock) < 0) {
    errors.stock = 'Stock must be a non-negative integer';
  }

  if (!data.category?.trim()) errors.category = 'Category is required';
  if (!data.brand?.trim()) errors.brand = 'Brand is required';

  if (!data.thumbnail?.trim()) errors.thumbnail = 'Thumbnail URL is required';
  else {
    try {
      new URL(data.thumbnail);
    } catch {
      errors.thumbnail = 'Must be a valid URL';
    }
  }

  return errors;
}

export default function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const { handleAdd, handleEdit } = useProducts();
  const isEdit = !!product;

  const [formData, setFormData] = useState<Partial<ProductFormData>>({
    title: product?.title ?? '',
    description: product?.description ?? '',
    price: product?.price ?? ('' as unknown as number),
    stock: product?.stock ?? ('' as unknown as number),
    category: product?.category ?? '',
    brand: product?.brand ?? '',
    thumbnail: product?.thumbnail ?? '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Prevent duplicate submissions
  const isSubmittingRef = useRef(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (isSubmittingRef.current) return;

    // Validate
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    isSubmittingRef.current = true;
    setLoading(true);
    setSubmitError(null);

    const payload: ProductFormData = {
      title: formData.title!.trim(),
      description: formData.description!.trim(),
      price: Number(formData.price),
      stock: Number(formData.stock),
      category: formData.category!.trim(),
      brand: formData.brand!.trim(),
      thumbnail: formData.thumbnail!.trim(),
    };

    try {
      if (isEdit && product) {
        await handleEdit(product.id, payload);
      } else {
        await handleAdd(payload);
      }
      setSuccess(true);
      // Navigate back to product list after a brief pause
      setTimeout(() => router.push('/products'), 800);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const fieldClass = (error?: string) =>
    `w-full px-3 py-2.5 rounded-lg border text-sm text-gray-900 placeholder-gray-400
    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow
    ${error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'}`;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100">
          <h1 className="text-xl font-semibold text-gray-900">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isEdit
              ? 'Update the product details below.'
              : 'Fill in the details to add a new product.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5" noValidate>
          {/* Success banner */}
          {success && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Product {isEdit ? 'updated' : 'added'} successfully! Redirecting…
            </div>
          )}

          {/* Submit error */}
          {submitError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {submitError}
            </div>
          )}

          {/* Title */}
          <div className="space-y-1">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Wireless Headphones"
              disabled={loading}
              className={fieldClass(errors.title)}
            />
            {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the product…"
              disabled={loading}
              className={`${fieldClass(errors.description)} resize-none`}
            />
            {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
          </div>

          {/* Price + Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Price (USD) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 text-sm pointer-events-none">
                  $
                </span>
                <input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  disabled={loading}
                  className={`${fieldClass(errors.price)} pl-7`}
                />
              </div>
              {errors.price && <p className="text-xs text-red-500">{errors.price}</p>}
            </div>

            <div className="space-y-1">
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
                Stock <span className="text-red-500">*</span>
              </label>
              <input
                id="stock"
                name="stock"
                type="number"
                min="0"
                step="1"
                value={formData.stock}
                onChange={handleChange}
                placeholder="0"
                disabled={loading}
                className={fieldClass(errors.stock)}
              />
              {errors.stock && <p className="text-xs text-red-500">{errors.stock}</p>}
            </div>
          </div>

          {/* Category + Brand */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category <span className="text-red-500">*</span>
              </label>
              <input
                id="category"
                name="category"
                type="text"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g. electronics"
                disabled={loading}
                className={fieldClass(errors.category)}
              />
              {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
            </div>

            <div className="space-y-1">
              <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
                Brand <span className="text-red-500">*</span>
              </label>
              <input
                id="brand"
                name="brand"
                type="text"
                value={formData.brand}
                onChange={handleChange}
                placeholder="e.g. Sony"
                disabled={loading}
                className={fieldClass(errors.brand)}
              />
              {errors.brand && <p className="text-xs text-red-500">{errors.brand}</p>}
            </div>
          </div>

          {/* Thumbnail URL */}
          <div className="space-y-1">
            <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700">
              Thumbnail URL <span className="text-red-500">*</span>
            </label>
            <input
              id="thumbnail"
              name="thumbnail"
              type="url"
              value={formData.thumbnail}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              disabled={loading}
              className={fieldClass(errors.thumbnail)}
            />
            {errors.thumbnail && <p className="text-xs text-red-500">{errors.thumbnail}</p>}
            {/* Thumbnail preview */}
            {formData.thumbnail && !errors.thumbnail && (
              <div className="mt-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={formData.thumbnail}
                  alt="Thumbnail preview"
                  className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            )}
          </div>

          {/* Note about persistence */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-700 flex items-start gap-2">
            <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              <strong>Note:</strong> DummyJSON does not persist changes server-side. Changes are saved
              locally for this session and will be visible in the product list.
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg
                transition-colors border border-gray-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white
                bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors
                disabled:opacity-60 disabled:cursor-not-allowed
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Saving…
                </>
              ) : success ? (
                'Saved!'
              ) : isEdit ? (
                'Save Changes'
              ) : (
                'Add Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
