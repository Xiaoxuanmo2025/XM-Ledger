import Decimal from 'decimal.js';
import { Currency } from './Currency';
import { TransactionType } from './TransactionType';

/**
 * Domain Entity: 交易记录
 *
 * 核心业务规则:
 * 1. 所有交易必须记录原始币种金额和币种类型
 * 2. 必须包含交易当日的汇率 (exchangeRate)
 * 3. amountCNY = originalAmount * exchangeRate (用于统计)
 * 4. 如果币种已经是 CNY,则 exchangeRate = 1
 */
export interface Transaction {
  id: string;

  // 原始交易信息
  originalAmount: Decimal;
  currency: Currency;

  // 汇率转换信息
  exchangeRate: Decimal;
  amountCNY: Decimal;

  // 交易元数据
  type: TransactionType;
  date: Date;
  description?: string;
  notes?: string;

  // 关联
  categoryId: string;
  userId: string;

  // 审计字段
  createdAt: Date;
  updatedAt: Date;

  // 关联的用户信息 (可选,用于显示)
  user?: {
    id: string;
    name?: string;
    email?: string;
  };
}

/**
 * 创建交易的输入数据
 */
export interface CreateTransactionInput {
  originalAmount: number | string | Decimal;
  currency: Currency;
  type: TransactionType;
  date: Date;
  description?: string;
  notes?: string;
  categoryId: string;
  userId: string;

  // 可选: 如果外部已经提供汇率,则使用该汇率
  // 否则系统会尝试自动获取当日汇率
  exchangeRate?: number | string | Decimal;
}

/**
 * 交易统计结果 (所有金额统一为 CNY)
 */
export interface TransactionSummary {
  totalIncome: Decimal;
  totalExpense: Decimal;
  balance: Decimal; // totalIncome - totalExpense
  transactionCount: number;
}

/**
 * 按分类统计结果
 */
export interface CategorySummary {
  categoryId: string;
  categoryName: string;
  amount: Decimal; // CNY
  percentage: number; // 占总支出/收入的百分比
  count: number;
}
