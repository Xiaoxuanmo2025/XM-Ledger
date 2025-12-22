import { Transaction as PrismaTransaction } from '@prisma/client';
import Decimal from 'decimal.js';
import { Transaction, Currency, TransactionType } from '@/domain/entities';

/**
 * Transaction Mapper
 *
 * 负责在 Prisma 模型和 Domain Entity 之间转换
 * 隔离基础设施细节,保持 Domain 层的纯粹性
 */
export class TransactionMapper {
  /**
   * Prisma 模型 -> Domain Entity
   */
  static toDomain(prismaTransaction: PrismaTransaction): Transaction {
    return {
      id: prismaTransaction.id,
      originalAmount: new Decimal(prismaTransaction.originalAmount.toString()),
      currency: prismaTransaction.currency as Currency,
      exchangeRate: new Decimal(prismaTransaction.exchangeRate.toString()),
      amountCNY: new Decimal(prismaTransaction.amountCNY.toString()),
      type: prismaTransaction.type as TransactionType,
      date: prismaTransaction.date,
      description: prismaTransaction.description ?? undefined,
      notes: prismaTransaction.notes ?? undefined,
      categoryId: prismaTransaction.categoryId,
      userId: prismaTransaction.userId,
      createdAt: prismaTransaction.createdAt,
      updatedAt: prismaTransaction.updatedAt,
    };
  }

  /**
   * Domain Entity -> Prisma 创建数据
   */
  static toPrismaCreate(transaction: Partial<Transaction>) {
    return {
      originalAmount: transaction.originalAmount?.toString(),
      currency: transaction.currency,
      exchangeRate: transaction.exchangeRate?.toString(),
      amountCNY: transaction.originalAmount && transaction.exchangeRate
        ? transaction.originalAmount.mul(transaction.exchangeRate).toString()
        : undefined,
      type: transaction.type,
      date: transaction.date,
      description: transaction.description,
      notes: transaction.notes,
      categoryId: transaction.categoryId,
      userId: transaction.userId,
    };
  }
}
