import { Transaction } from '@/domain/entities';
import { ITransactionRepository, TransactionFilters } from '../ports';

/**
 * Get Transactions Use Case
 *
 * 查询交易记录,支持过滤和分页
 */
export class GetTransactionsUseCase {
  constructor(private transactionRepo: ITransactionRepository) {}

  async execute(filters?: TransactionFilters): Promise<Transaction[]> {
    return this.transactionRepo.findAll(filters);
  }

  /**
   * 按日期范围查询
   */
  async executeByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<Transaction[]> {
    return this.transactionRepo.findByDateRange(startDate, endDate);
  }

  /**
   * 查询单条交易
   */
  async executeById(id: string): Promise<Transaction | null> {
    return this.transactionRepo.findById(id);
  }
}
