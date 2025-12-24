import { PrismaClient } from '@prisma/client';
import Decimal from 'decimal.js';
import {
  Transaction,
  CreateTransactionInput,
  TransactionType,
} from '@/domain/entities';
import {
  ITransactionRepository,
  TransactionFilters,
} from '@/use-cases/ports';
import { TransactionMapper } from './mappers/TransactionMapper';

/**
 * Prisma Transaction Repository Implementation
 */
export class PrismaTransactionRepository implements ITransactionRepository {
  constructor(private prisma: PrismaClient) {}

  async create(input: CreateTransactionInput): Promise<Transaction> {
    const originalAmount = new Decimal(input.originalAmount);
    const exchangeRate = new Decimal(input.exchangeRate ?? 1);
    const amountCNY = originalAmount.mul(exchangeRate);

    const transaction = await this.prisma.transaction.create({
      data: {
        originalAmount: originalAmount.toString(),
        currency: input.currency,
        exchangeRate: exchangeRate.toString(),
        amountCNY: amountCNY.toString(),
        type: input.type,
        date: input.date,
        description: input.description,
        notes: input.notes,
        categoryId: input.categoryId,
        userId: input.userId,
      },
    });

    return TransactionMapper.toDomain(transaction);
  }

  async findById(id: string): Promise<Transaction | null> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
    });

    return transaction ? TransactionMapper.toDomain(transaction) : null;
  }

  async findByUser(
    userId: string,
    filters?: TransactionFilters
  ): Promise<Transaction[]> {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        ...(filters?.type && { type: filters.type }),
        ...(filters?.categoryId && { categoryId: filters.categoryId }),
        ...(filters?.startDate &&
          filters?.endDate && {
            date: {
              gte: filters.startDate,
              lte: filters.endDate,
            },
          }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { date: 'desc' },
      take: filters?.limit,
      skip: filters?.offset,
    });

    return transactions.map(TransactionMapper.toDomain);
  }

  async findByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
    type?: TransactionType
  ): Promise<Transaction[]> {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        ...(type && { type }),
      },
      orderBy: { date: 'desc' },
    });

    return transactions.map(TransactionMapper.toDomain);
  }

  async update(
    id: string,
    data: Partial<CreateTransactionInput>
  ): Promise<Transaction> {
    // 如果更新了金额或汇率,需要重新计算 amountCNY
    let amountCNY: string | undefined;
    if (data.originalAmount !== undefined || data.exchangeRate !== undefined) {
      // 先获取现有数据
      const existing = await this.prisma.transaction.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new Error('Transaction not found');
      }

      const originalAmount = data.originalAmount
        ? new Decimal(data.originalAmount)
        : new Decimal(existing.originalAmount.toString());

      const exchangeRate = data.exchangeRate
        ? new Decimal(data.exchangeRate)
        : new Decimal(existing.exchangeRate.toString());

      amountCNY = originalAmount.mul(exchangeRate).toString();
    }

    const transaction = await this.prisma.transaction.update({
      where: { id },
      data: {
        ...(data.originalAmount !== undefined && {
          originalAmount: new Decimal(data.originalAmount).toString(),
        }),
        ...(data.currency && { currency: data.currency }),
        ...(data.exchangeRate !== undefined && {
          exchangeRate: new Decimal(data.exchangeRate).toString(),
        }),
        ...(amountCNY && { amountCNY }),
        ...(data.type && { type: data.type }),
        ...(data.date && { date: data.date }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.categoryId && { categoryId: data.categoryId }),
      },
    });

    return TransactionMapper.toDomain(transaction);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.transaction.delete({
      where: { id },
    });
  }

  async getSummaryByMonth(
    userId: string,
    year: number,
    month: number
  ): Promise<{
    totalIncome: number;
    totalExpense: number;
    balance: number;
  }> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const [incomeResult, expenseResult] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: {
          userId,
          type: TransactionType.INCOME,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: {
          amountCNY: true,
        },
      }),
      this.prisma.transaction.aggregate({
        where: {
          userId,
          type: TransactionType.EXPENSE,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: {
          amountCNY: true,
        },
      }),
    ]);

    const totalIncome = incomeResult._sum.amountCNY
      ? parseFloat(incomeResult._sum.amountCNY.toString())
      : 0;

    const totalExpense = expenseResult._sum.amountCNY
      ? parseFloat(expenseResult._sum.amountCNY.toString())
      : 0;

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    };
  }

  async getSummaryByCategory(
    userId: string,
    startDate: Date,
    endDate: Date,
    type: TransactionType
  ): Promise<
    Array<{
      categoryId: string;
      categoryName: string;
      amount: number;
      count: number;
    }>
  > {
    const results = await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId,
        type,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amountCNY: true,
      },
      _count: {
        id: true,
      },
    });

    // 获取分类名称
    const categoryIds = results.map((r) => r.categoryId);
    const categories = await this.prisma.category.findMany({
      where: {
        id: {
          in: categoryIds,
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

    return results.map((r) => ({
      categoryId: r.categoryId,
      categoryName: categoryMap.get(r.categoryId) ?? 'Unknown',
      amount: r._sum.amountCNY ? parseFloat(r._sum.amountCNY.toString()) : 0,
      count: r._count.id,
    }));
  }

  async getAvailableMonths(userId: string): Promise<Array<{ year: number; month: number }>> {
    // 查询所有交易的日期
    const transactions = await this.prisma.transaction.findMany({
      where: { userId },
      select: { date: true },
      orderBy: { date: 'desc' },
    });

    // 提取唯一的年月组合
    const monthsSet = new Set<string>();
    transactions.forEach((tx) => {
      const year = tx.date.getFullYear();
      const month = tx.date.getMonth() + 1;
      monthsSet.add(`${year}-${month}`);
    });

    // 转换为数组并排序（最新的在前）
    const months = Array.from(monthsSet)
      .map((key) => {
        const [year, month] = key.split('-').map(Number);
        return { year, month };
      })
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      });

    // 确保当前月份在列表中（即使没有数据）
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const hasCurrentMonth = months.some(
      (m) => m.year === currentYear && m.month === currentMonth
    );

    if (!hasCurrentMonth) {
      months.unshift({ year: currentYear, month: currentMonth });
    }

    return months;
  }
}
