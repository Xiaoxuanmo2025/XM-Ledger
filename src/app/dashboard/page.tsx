import { redirect } from 'next/navigation';

/**
 * Dashboard Page - 重定向到 overview 页面
 */
export default async function DashboardPage() {
  redirect('/dashboard/overview');
}
