import { InvalidTransactionError } from '@/domain/errors/DomainError';
import { AuditAction } from '@/domain/entities';
import { ITransactionRepository, IAuditLogRepository } from '../ports';

/**
 * Delete Transaction Use Case
 *
 * 删除交易并记录审计日志
 */
export class DeleteTransactionUseCase {
  constructor(
    private transactionRepo: ITransactionRepository,
    private auditLogRepo: IAuditLogRepository
  ) {}

  async execute(id: string, userId: string): Promise<void> {
    // 1. 检查交易是否存在
    const transaction = await this.transactionRepo.findById(id);
    if (!transaction) {
      throw new InvalidTransactionError('交易不存在');
    }

    // 3. 记录审计日志（在删除前记录完整信息）
    await this.auditLogRepo.create({
      action: AuditAction.DELETE_TRANSACTION,
      userId,
      entityType: 'Transaction',
      entityId: id,
      details: {
        type: transaction.type,
        amount: transaction.originalAmount.toString(),
        currency: transaction.currency,
        amountCNY: transaction.amountCNY.toString(),
        categoryId: transaction.categoryId,
        date: transaction.date.toISOString(),
        description: transaction.description,
        ownerId: transaction.userId, // 记录交易所属用户
        createdAt: transaction.createdAt.toISOString(),
      },
    });

    // 4. 删除
    await this.transactionRepo.delete(id);
  }
}
