'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/infrastructure/auth';
import { prisma } from '@/infrastructure/database';
import {
  PrismaTransactionRepository,
  PrismaCategoryRepository,
  PrismaExchangeRateRepository,
  createExchangeRateService,
} from '@/infrastructure';
import {
  CreateTransactionUseCase,
  GetMonthlyReportUseCase,
} from '@/use-cases';
import { Currency, TransactionType } from '@/domain/entities';

/**
 * Server Actions for Dashboard
 */

/**
 * 创建交易
 */
export async function createTransaction(data: {
  type: TransactionType;
  categoryId: string;
  originalAmount: string;
  currency: Currency;
  date: string;
  description?: string;
  notes?: string;
  exchangeRate?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  // 初始化依赖
  const transactionRepo = new PrismaTransactionRepository(prisma);
  const categoryRepo = new PrismaCategoryRepository(prisma);
  const exchangeRateRepo = new PrismaExchangeRateRepository(prisma);
  const currencyService = createExchangeRateService();

  const useCase = new CreateTransactionUseCase(
    transactionRepo,
    categoryRepo,
    exchangeRateRepo,
    currencyService
  );

  // 执行创建
  await useCase.execute({
    type: data.type,
    categoryId: data.categoryId,
    originalAmount: data.originalAmount,
    currency: data.currency,
    date: new Date(data.date),
    description: data.description,
    notes: data.notes,
    exchangeRate: data.exchangeRate,
    userId: session.user.id,
  });

  revalidatePath('/dashboard');
}

/**
 * 获取月度报表
 */
export async function getMonthlyReport(year: number, month: number) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const transactionRepo = new PrismaTransactionRepository(prisma);
  const useCase = new GetMonthlyReportUseCase(transactionRepo);

  const report = await useCase.execute(session.user.id, year, month);

  // 转换 Decimal 为数字 (用于 JSON 序列化)
  return {
    year: report.year,
    month: report.month,
    summary: {
      totalIncome: report.summary.totalIncome.toNumber(),
      totalExpense: report.summary.totalExpense.toNumber(),
      balance: report.summary.balance.toNumber(),
      transactionCount: report.summary.transactionCount,
    },
    expenseByCategory: report.expenseByCategory.map((cat) => ({
      categoryId: cat.categoryId,
      categoryName: cat.categoryName,
      amount: cat.amount.toNumber(),
      percentage: cat.percentage,
      count: cat.count,
    })),
    incomeByCategory: report.incomeByCategory.map((cat) => ({
      categoryId: cat.categoryId,
      categoryName: cat.categoryName,
      amount: cat.amount.toNumber(),
      percentage: cat.percentage,
      count: cat.count,
    })),
  };
}

/**
 * 获取用户的分类列表
 */
export async function getCategories() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const categoryRepo = new PrismaCategoryRepository(prisma);

  const categories = await categoryRepo.findByUser(session.user.id);

  return categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    type: cat.type,
    color: cat.color,
    icon: cat.icon,
  }));
}

/**
 * 获取或初始化分类 (首次使用时自动创建)
 * 注意: 不使用 revalidatePath,因为这是在渲染时调用的
 */
export async function getOrInitializeCategories() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const categoryRepo = new PrismaCategoryRepository(prisma);

  // 检查是否已有分类
  const existing = await categoryRepo.findByUser(session.user.id);
  if (existing.length > 0) {
    return existing.map((cat) => ({
      id: cat.id,
      name: cat.name,
      type: cat.type,
      color: cat.color,
      icon: cat.icon,
    }));
  }

  // 创建默认分类 (首次使用)
  const categories = await categoryRepo.createDefaultCategories(session.user.id);

  return categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    type: cat.type,
    color: cat.color,
    icon: cat.icon,
  }));
}
