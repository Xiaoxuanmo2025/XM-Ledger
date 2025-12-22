import { Transaction } from '@/domain/entities';
import { ITransactionRepository, TransactionFilters } from './ports';

/**
 * Get Transactions Use Case
 *
 * 查询用户的交易记录,支持过滤和分页
 */
export class GetTransactionsUseCase {
  constructor(private transactionRepo: ITransactionRepository) {}

  async execute(userId: string, filters?: TransactionFilters): Promise<Transaction[]> {
    return this.transactionRepo.findByUser(userId, filters);
  }

  /**
   * 按日期范围查询
   */
  async executeByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Transaction[]> {
    return this.transactionRepo.findByDateRange(userId, startDate, endDate);
  }

  /**
   * 查询单条交易
   */
  async executeById(id: string): Promise<Transaction | null> {
    return this.transactionRepo.findById(id);
  }
}
