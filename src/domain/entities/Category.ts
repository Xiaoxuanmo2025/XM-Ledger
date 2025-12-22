import { TransactionType } from './TransactionType';

/**
 * Domain Entity: 交易分类
 *
 * 业务规则:
 * 1. 每个分类必须属于收入或支出
 * 2. 同一用户下,同类型的分类名称不能重复
 */
export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color?: string;
  icon?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 创建分类的输入数据
 */
export interface CreateCategoryInput {
  name: string;
  type: TransactionType;
  color?: string;
  icon?: string;
  userId: string;
}
