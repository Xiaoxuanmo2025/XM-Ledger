'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/infrastructure/auth';
import { prisma } from '@/infrastructure/database';
import {
  PrismaTransactionRepository,
  PrismaCategoryRepository,
  PrismaExchangeRateRepository,
  PrismaAuditLogRepository,
  createExchangeRateService,
} from '@/infrastructure';
import {
  CreateTransactionUseCase,
  DeleteTransactionUseCase,
  GetMonthlyReportUseCase,
  ManageCategoryUseCase,
  ExportTransactionsUseCase,
  ImportTransactionsUseCase,
} from '@/use-cases';
import { Currency, TransactionType, CreateCategoryInput } from '@/domain/entities';
import { convertToCSV, parseCSV, CSVTransaction } from '@/infrastructure/utils/csvHelper';

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
  const auditLogRepo = new PrismaAuditLogRepository(prisma);

  const useCase = new CreateTransactionUseCase(
    transactionRepo,
    categoryRepo,
    exchangeRateRepo,
    currencyService,
    auditLogRepo
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

  const report = await useCase.execute(year, month);

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
 * 获取分类列表
 */
export async function getCategories() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const categoryRepo = new PrismaCategoryRepository(prisma);

  const categories = await categoryRepo.findAll();

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
  const existing = await categoryRepo.findAll();
  if (existing.length > 0) {
    return existing.map((cat) => ({
      id: cat.id,
      name: cat.name,
      type: cat.type,
      color: cat.color,
      icon: cat.icon,
      parentId: cat.parentId,
      children: cat.children?.map((child) => ({
        id: child.id,
        name: child.name,
        type: child.type,
        color: child.color,
        icon: child.icon,
        parentId: child.parentId,
      })),
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
    parentId: cat.parentId,
    children: cat.children?.map((child) => ({
      id: child.id,
      name: child.name,
      type: child.type,
      color: child.color,
      icon: child.icon,
      parentId: child.parentId,
    })),
  }));
}

/**
 * 创建分类
 */
export async function createCategory(data: Omit<CreateCategoryInput, 'userId'>) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const categoryRepo = new PrismaCategoryRepository(prisma);
  const useCase = new ManageCategoryUseCase(categoryRepo);

  const category = await useCase.create({
    ...data,
    userId: session.user.id,
  });

  revalidatePath('/dashboard');

  return {
    id: category.id,
    name: category.name,
    type: category.type,
    color: category.color,
    icon: category.icon,
    parentId: category.parentId,
  };
}

/**
 * 删除分类
 */
export async function deleteCategory(categoryId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const categoryRepo = new PrismaCategoryRepository(prisma);
  const useCase = new ManageCategoryUseCase(categoryRepo);

  await useCase.delete(categoryId, session.user.id);

  revalidatePath('/dashboard');
}

/**
 * 删除交易
 */
export async function deleteTransaction(transactionId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const transactionRepo = new PrismaTransactionRepository(prisma);
  const auditLogRepo = new PrismaAuditLogRepository(prisma);
  const useCase = new DeleteTransactionUseCase(transactionRepo, auditLogRepo);

  await useCase.execute(transactionId, session.user.id);

  revalidatePath('/dashboard');
}

/**
 * 导出交易记录为 CSV
 */
export async function exportTransactionsToCSV(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const transactionRepo = new PrismaTransactionRepository(prisma);
  const categoryRepo = new PrismaCategoryRepository(prisma);
  const auditLogRepo = new PrismaAuditLogRepository(prisma);
  const useCase = new ExportTransactionsUseCase(transactionRepo, categoryRepo, auditLogRepo);

  const csvData = await useCase.execute(session.user.id);
  const csvContent = convertToCSV(csvData);

  return csvContent;
}

/**
 * 从 CSV 导入交易记录
 */
export async function importTransactionsFromCSV(csvContent: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  // 解析 CSV
  const csvData = parseCSV(csvContent);

  // 初始化依赖
  const transactionRepo = new PrismaTransactionRepository(prisma);
  const categoryRepo = new PrismaCategoryRepository(prisma);
  const exchangeRateRepo = new PrismaExchangeRateRepository(prisma);
  const currencyService = createExchangeRateService();
  const auditLogRepo = new PrismaAuditLogRepository(prisma);

  const useCase = new ImportTransactionsUseCase(
    transactionRepo,
    categoryRepo,
    exchangeRateRepo,
    currencyService,
    auditLogRepo
  );

  const result = await useCase.execute(session.user.id, csvData);

  revalidatePath('/dashboard');

  return result;
}

/**
 * 获取有交易数据的月份列表
 */
export async function getAvailableMonths() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const transactionRepo = new PrismaTransactionRepository(prisma);
  return await transactionRepo.getAvailableMonths();
}

/**
 * 获取总体统计数据（所有时间）
 */
export async function getOverallSummary() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const transactionRepo = new PrismaTransactionRepository(prisma);
  const summary = await transactionRepo.getOverallSummary();

  // 获取总体收支构成
  const [expenseByCategory, incomeByCategory] = await Promise.all([
    transactionRepo.getOverallSummaryByCategory(TransactionType.EXPENSE),
    transactionRepo.getOverallSummaryByCategory(TransactionType.INCOME),
  ]);

  // 计算百分比
  const expenseSummaries = expenseByCategory.map((cat) => ({
    categoryId: cat.categoryId,
    categoryName: cat.categoryName,
    amount: cat.amount,
    percentage: summary.totalExpense > 0 ? (cat.amount / summary.totalExpense) * 100 : 0,
    count: cat.count,
  }));

  const incomeSummaries = incomeByCategory.map((cat) => ({
    categoryId: cat.categoryId,
    categoryName: cat.categoryName,
    amount: cat.amount,
    percentage: summary.totalIncome > 0 ? (cat.amount / summary.totalIncome) * 100 : 0,
    count: cat.count,
  }));

  return {
    summary: {
      totalIncome: summary.totalIncome,
      totalExpense: summary.totalExpense,
      balance: summary.balance,
    },
    expenseByCategory: expenseSummaries,
    incomeByCategory: incomeSummaries,
  };
}

/**
 * 获取审计日志
 */
export async function getAuditLogs(filters?: { limit?: number }) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const auditLogRepo = new PrismaAuditLogRepository(prisma);
  const logs = await auditLogRepo.findAll({
    limit: filters?.limit || 50,
  });

  // 转换为可序列化的格式
  return logs.map((log) => ({
    id: log.id,
    action: log.action,
    userId: log.userId,
    entityType: log.entityType,
    entityId: log.entityId,
    details: log.details,
    ipAddress: log.ipAddress,
    userAgent: log.userAgent,
    createdAt: log.createdAt.toISOString(),
    user: log.user,
  }));
}
