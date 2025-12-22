import { auth } from '@/infrastructure/auth';

/**
 * Middleware for route protection
 *
 * 保护 /dashboard 路由,要求用户登录
 */
export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // 保护 dashboard 路由
  if (pathname.startsWith('/dashboard') && !isLoggedIn) {
    const url = new URL('/auth/signin', req.url);
    return Response.redirect(url);
  }

  // API 路由也需要保护
  if (pathname.startsWith('/api') && !pathname.startsWith('/api/auth') && !isLoggedIn) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
