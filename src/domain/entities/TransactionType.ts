/**
 * Domain Entity: 交易类型
 */
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  [TransactionType.INCOME]: '收入',
  [TransactionType.EXPENSE]: '支出',
};
