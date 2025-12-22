import Link from 'next/link';

/**
 * Auth Error Page
 */
export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params.error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">登录失败</h1>
          <p className="text-gray-600">
            {error === 'AccessDenied'
              ? '您的邮箱未在白名单中,无法访问此系统。'
              : '登录过程中出现错误,请重试。'}
          </p>
        </div>

        <Link
          href="/auth/signin"
          className="block w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-lg transition-colors text-center"
        >
          返回登录
        </Link>

        <p className="mt-4 text-center text-sm text-gray-500">
          如需获取访问权限,请联系系统管理员
        </p>
      </div>
    </div>
  );
}
