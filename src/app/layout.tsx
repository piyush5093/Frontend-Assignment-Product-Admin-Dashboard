import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ProductsProvider } from '@/context/ProductsContext';
import Navbar from '@/components/layout/Navbar';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });

export const metadata: Metadata = {
  title: 'Product Admin Dashboard',
  description: 'Manage your products with ease',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full bg-gray-50 font-sans antialiased flex flex-col">
        <AuthProvider>
          <ProductsProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
          </ProductsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
