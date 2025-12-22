import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Lightweight Middleware for Vercel Edge Runtime
 *
 * 为了避免 Edge Function 1MB 限制,这里只做简单的路由重定向
 * 实际的认证检查在页面组件的 Server Component 中进行
 *
 * 参考: https://nextjs.org/docs/app/building-your-application/authentication
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 允许访问认证相关路径
  if (
    pathname.startsWith('/auth') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }

  // 检查是否有 session cookie (Auth.js 默认使用 next-auth.session-token)
  const sessionToken =
    request.cookies.get('next-auth.session-token') ||
    request.cookies.get('__Secure-next-auth.session-token'); // 生产环境

  // 如果访问受保护路由且没有 session,重定向到登录
  if (pathname.startsWith('/dashboard') && !sessionToken) {
    const url = new URL('/auth/signin', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径,除了:
     * - _next/static (静态文件)
     * - _next/image (图片优化)
     * - favicon.ico, sitemap.xml, robots.txt
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
