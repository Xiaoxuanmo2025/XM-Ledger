import {
  Transaction,
  CreateTransactionInput,
  TransactionType,
} from '@/domain/entities';

/**
 * Transaction Repository Interface (Port)
 *
 * 定义交易数据访问的抽象接口
 * 遵循 Dependency Inversion Principle (依赖倒置原则)
 * Use Case 层依赖此接口,Infrastructure 层实现此接口
 */
export interface ITransactionRepository {
  /**
   * 创建新交易
   */
  create(input: CreateTransactionInput): Promise<Transaction>;

  /**
   * 根据 ID 查找交易
   */
  findById(id: string): Promise<Transaction | null>;

  /**
   * 查找所有交易
   * @param filters - 可选的过滤条件
   */
  findAll(filters?: TransactionFilters): Promise<Transaction[]>;

  /**
   * 查找指定日期范围内的交易
   */
  findByDateRange(
    startDate: Date,
    endDate: Date,
    type?: TransactionType
  ): Promise<Transaction[]>;

  /**
   * 更新交易
   */
  update(id: string, data: Partial<CreateTransactionInput>): Promise<Transaction>;

  /**
   * 删除交易
   */
  delete(id: string): Promise<void>;

  /**
   * 统计指定月份的收支总额 (CNY)
   */
  getSummaryByMonth(
    year: number,
    month: number
  ): Promise<{
    totalIncome: number;
    totalExpense: number;
    balance: number;
  }>;

  /**
   * 按分类统计指定时间范围的支出/收入
   */
  getSummaryByCategory(
    startDate: Date,
    endDate: Date,
    type: TransactionType
  ): Promise<Array<{
    categoryId: string;
    categoryName: string;
    amount: number; // CNY
    count: number;
  }>>;

  /**
   * 获取所有有交易数据的月份列表
   * @returns Array of { year, month } sorted by date descending (最新的在前)
   */
  getAvailableMonths(): Promise<Array<{ year: number; month: number }>>;
}

/**
 * 交易查询过滤条件
 */
export interface TransactionFilters {
  type?: TransactionType;
  categoryId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}
