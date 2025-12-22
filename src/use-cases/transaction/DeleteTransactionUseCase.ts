import { InvalidTransactionError } from '@/domain/errors/DomainError';
import { ITransactionRepository } from '../ports';

/**
 * Delete Transaction Use Case
 */
export class DeleteTransactionUseCase {
  constructor(private transactionRepo: ITransactionRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    // 1. 检查交易是否存在
    const transaction = await this.transactionRepo.findById(id);
    if (!transaction) {
      throw new InvalidTransactionError('交易不存在');
    }

    // 2. 验证权限
    if (transaction.userId !== userId) {
      throw new InvalidTransactionError('无权删除此交易');
    }

    // 3. 删除
    await this.transactionRepo.delete(id);
  }
}
