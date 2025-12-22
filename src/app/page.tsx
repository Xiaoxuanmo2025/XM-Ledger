import { redirect } from 'next/navigation';

/**
 * Home Page - 重定向到 Dashboard
 */
export default function Home() {
  redirect('/dashboard');
}
