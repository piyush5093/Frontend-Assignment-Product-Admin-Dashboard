import { redirect } from 'next/navigation';

// Root page redirects to the product list
export default function Home() {
  redirect('/products');
}
