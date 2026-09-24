import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-indigo-50 rounded-3xl mb-6">
          <span className="text-4xl font-bold text-indigo-400">404</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Page Not Found</h1>
        <p className="text-gray-500 text-sm mb-8 max-w-sm">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700
            text-white font-semibold rounded-xl transition-colors text-sm"
        >
          Go to Products
        </Link>
      </div>
    </div>
  );
}
