import { PrismaClient } from '@prisma/client';

/**
 * Prisma Client Singleton
 *
 * 在开发环境中,Next.js 的热重载会创建多个 PrismaClient 实例
 * 使用全局变量确保只创建一个实例
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * 优雅关闭数据库连接
 */
export async function disconnectDatabase() {
  await prisma.$disconnect();
}
