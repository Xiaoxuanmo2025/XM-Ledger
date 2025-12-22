import type { NextAuthConfig } from 'next-auth';
import GitHub from 'next-auth/providers/github';

/**
 * Auth.js Configuration
 *
 * 核心配置:
 * 1. GitHub OAuth Provider
 * 2. 邮箱白名单验证
 * 3. 会话策略
 */
export const authConfig = {
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    /**
     * 登录时检查邮箱白名单
     */
    async signIn({ user, account, profile }) {
      if (!user.email) {
        return false;
      }

      // 获取白名单
      const allowedUsers = process.env.ALLOWED_USERS?.split(',').map((email) =>
        email.trim().toLowerCase()
      ) || [];

      // 检查是否在白名单中
      const isAllowed = allowedUsers.includes(user.email.toLowerCase());

      if (!isAllowed) {
        console.warn(`Unauthorized login attempt: ${user.email}`);
        return false;
      }

      return true;
    },

    /**
     * JWT 回调
     */
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },

    /**
     * Session 回调
     */
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      return session;
    },

    /**
     * 授权检查 (用于 middleware)
     */
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnAuth = nextUrl.pathname.startsWith('/auth');

      if (isOnDashboard) {
        // Dashboard 需要登录
        if (isLoggedIn) return true;
        return false;
      } else if (isLoggedIn && isOnAuth) {
        // 已登录用户访问登录页,重定向到 dashboard
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      return true;
    },
  },
  session: {
    strategy: 'jwt',
  },
} satisfies NextAuthConfig;
