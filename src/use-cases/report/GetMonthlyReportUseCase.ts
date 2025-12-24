import Decimal from 'decimal.js';
import { TransactionType, TransactionSummary, CategorySummary } from '@/domain/entities';
import { ITransactionRepository } from '../ports';

/**
 * Get Monthly Report Use Case
 *
 * 生成指定月份的财务报表,包括:
 * 1. 总收入、总支出、净余额 (所有金额统一为 CNY)
 * 2. 按分类统计的收支情况
 * 3. 支出/收入占比
 */
export class GetMonthlyReportUseCase {
  constructor(private transactionRepo: ITransactionRepository) {}

  async execute(year: number, month: number): Promise<MonthlyReport> {
    // 1. 获取月度汇总数据
    const summary = await this.transactionRepo.getSummaryByMonth(year, month);

    // 2. 计算日期范围
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59); // 该月最后一天

    // 3. 获取分类统计 (收入和支出分别统计)
    const [expenseByCategory, incomeByCategory] = await Promise.all([
      this.transactionRepo.getSummaryByCategory(
        startDate,
        endDate,
        TransactionType.EXPENSE
      ),
      this.transactionRepo.getSummaryByCategory(
        startDate,
        endDate,
        TransactionType.INCOME
      ),
    ]);

    // 4. 计算百分比
    const expenseSummaries = this.calculatePercentages(
      expenseByCategory,
      summary.totalExpense
    );
    const incomeSummaries = this.calculatePercentages(
      incomeByCategory,
      summary.totalIncome
    );

    return {
      year,
      month,
      summary: {
        totalIncome: new Decimal(summary.totalIncome),
        totalExpense: new Decimal(summary.totalExpense),
        balance: new Decimal(summary.balance),
        transactionCount: expenseByCategory.reduce((sum, cat) => sum + cat.count, 0) +
                         incomeByCategory.reduce((sum, cat) => sum + cat.count, 0),
      },
      expenseByCategory: expenseSummaries,
      incomeByCategory: incomeSummaries,
    };
  }

  /**
   * 计算各分类的百分比
   */
  private calculatePercentages(
    categories: Array<{
      categoryId: string;
      categoryName: string;
      amount: number;
      count: number;
    }>,
    total: number
  ): CategorySummary[] {
    return categories.map((cat) => ({
      categoryId: cat.categoryId,
      categoryName: cat.categoryName,
      amount: new Decimal(cat.amount),
      percentage: total > 0 ? (cat.amount / total) * 100 : 0,
      count: cat.count,
    }));
  }
}

/**
 * 月度报表结果
 */
export interface MonthlyReport {
  year: number;
  month: number;
  summary: TransactionSummary;
  expenseByCategory: CategorySummary[];
  incomeByCategory: CategorySummary[];
}
