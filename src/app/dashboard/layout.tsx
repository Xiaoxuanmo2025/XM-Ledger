import { auth, signOut } from '@/infrastructure/auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';

/**
 * Dashboard Layout
 *
 * 侧边栏导航 + 顶部栏
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold text-gray-900">XM Ledger</h1>
              <nav className="hidden md:flex gap-6">
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-gray-900 font-medium"
                >
                  总览
                </Link>
                <Link
                  href="/dashboard/transactions"
                  className="text-gray-700 hover:text-gray-900 font-medium"
                >
                  交易记录
                </Link>
                <Link
                  href="/dashboard/categories"
                  className="text-gray-700 hover:text-gray-900 font-medium"
                >
                  分类管理
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                {session.user.email}
              </div>
              <form
                action={async () => {
                  'use server';
                  await signOut({ redirectTo: '/auth/signin' });
                }}
              >
                <button
                  type="submit"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  退出
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
