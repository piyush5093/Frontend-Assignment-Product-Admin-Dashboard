'use client';

/**
 * LoginForm — handles the login form with:
 * - Controlled inputs (username, password)
 * - Inline error message for failed auth
 * - Submit button disabled while request is in-flight (prevents double-submit)
 * - Calls useAuth().login() which stores the token and redirects to /products
 */

import { useState, FormEvent, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function LoginForm() {
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Ref to prevent multiple simultaneous submissions
  const isSubmittingRef = useRef(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Guard against multiple rapid submissions
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    setError(null);
    setLoading(true);

    try {
      await login(username.trim(), password);
      // On success, login() redirects to /products — no further action needed.
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Invalid username or password. Please try again.'
      );
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-8 text-white text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 rounded-xl mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold">ProductAdmin</h1>
            <p className="text-indigo-200 text-sm mt-1">Sign in to your account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5" noValidate>
            {/* Error banner */}
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm"
              >
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Username */}
            <div className="space-y-1.5">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. emilys"
                autoComplete="username"
                required
                disabled={loading}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                  disabled:bg-gray-50 disabled:text-gray-500 transition-shadow text-sm"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  className="w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                    disabled:bg-gray-50 disabled:text-gray-500 transition-shadow text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Hint */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-4 py-3 text-xs text-indigo-700 space-y-0.5">
              <p><strong>Demo credentials:</strong></p>
              <p>Username: <code className="bg-indigo-100 px-1 rounded">emilys</code></p>
              <p>Password: <code className="bg-indigo-100 px-1 rounded">emilyspass</code></p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700
                disabled:bg-indigo-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg
                transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Product Admin Dashboard · Powered by DummyJSON
        </p>
      </div>
    </div>
  );
}
