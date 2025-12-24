import { ITransactionRepository, ICategoryRepository, IAuditLogRepository } from '../ports';
import { AuditAction } from '@/domain/entities';
import { CSVTransaction } from '@/infrastructure/utils/csvHelper';

/**
 * Export Transactions Use Case
 *
 * 导出交易并记录审计日志
 */
export class ExportTransactionsUseCase {
  constructor(
    private transactionRepo: ITransactionRepository,
    private categoryRepo: ICategoryRepository,
    private auditLogRepo: IAuditLogRepository
  ) {}

  async execute(userId: string): Promise<CSVTransaction[]> {
    // 获取用户的所有交易
    const transactions = await this.transactionRepo.findByUser(userId);

    // 获取用户的所有分类（用于查找父分类）
    const categories = await this.categoryRepo.findByUser(userId);
    const categoryMap = new Map(categories.map((cat) => [cat.id, cat]));

    // 转换为 CSV 格式
    const csvData: CSVTransaction[] = transactions.map((tx) => {
      const category = categoryMap.get(tx.categoryId);
      let parentCategoryName = '';
      let childCategoryName = '';

      if (category) {
        if (category.parentId) {
          // 这是子分类
          const parentCategory = categoryMap.get(category.parentId);
          parentCategoryName = parentCategory?.name || '';
          childCategoryName = category.name;
        } else {
          // 这是父分类
          parentCategoryName = category.name;
          childCategoryName = '';
        }
      }

      return {
        日期: tx.date.toISOString().split('T')[0], // YYYY-MM-DD
        类型: tx.type === 'INCOME' ? '收入' : '支出',
        一级分类: parentCategoryName,
        二级分类: childCategoryName,
        描述: tx.description || '',
        原始金额: tx.originalAmount.toString(),
        币种: tx.currency,
        汇率: tx.exchangeRate.toString(),
        人民币金额: tx.amountCNY.toString(),
        备注: tx.notes || '',
      };
    });

    // 记录导出操作的审计日志
    await this.auditLogRepo.create({
      action: AuditAction.EXPORT_TRANSACTIONS,
      userId,
      details: {
        transactionCount: transactions.length,
        exportDate: new Date().toISOString(),
      },
    });

    return csvData;
  }
}
