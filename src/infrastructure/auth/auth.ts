import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/infrastructure/database';
import { authConfig } from './auth.config';

/**
 * NextAuth Instance
 *
 * 使用 Prisma Adapter 存储用户会话数据
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  ...authConfig,
});
