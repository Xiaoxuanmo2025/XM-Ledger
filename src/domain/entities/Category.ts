import { TransactionType } from './TransactionType';

/**
 * Domain Entity: 交易分类
 *
 * 业务规则:
 * 1. 每个分类必须属于收入或支出
 * 2. 同一用户下,同类型同父分类的名称不能重复
 * 3. 支持两级分类: 父分类(parentId=null) 和 子分类(parentId不为null)
 * 4. 交易只能关联到子分类,如果分类没有子分类则可以直接使用
 */
export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color?: string;
  icon?: string;
  parentId?: string | null; // 父分类ID,null表示这是一级分类
  userId: string;
  createdAt: Date;
  updatedAt: Date;

  // 可选的关联数据 (需要时加载)
  children?: Category[]; // 子分类列表
  parent?: Category | null; // 父分类
}

/**
 * 创建分类的输入数据
 */
export interface CreateCategoryInput {
  name: string;
  type: TransactionType;
  color?: string;
  icon?: string;
  parentId?: string | null; // 父分类ID (可选,用于创建子分类)
  userId: string;
}
