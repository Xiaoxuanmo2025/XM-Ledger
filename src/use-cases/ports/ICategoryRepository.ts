import { Category, CreateCategoryInput, TransactionType } from '@/domain/entities';

/**
 * Category Repository Interface (Port)
 */
export interface ICategoryRepository {
  /**
   * 创建分类
   */
  create(input: CreateCategoryInput): Promise<Category>;

  /**
   * 根据 ID 查找分类 (包含子分类)
   */
  findById(id: string, includeChildren?: boolean): Promise<Category | null>;

  /**
   * 查找用户的所有分类 (包含子分类)
   */
  findByUser(userId: string, type?: TransactionType): Promise<Category[]>;

  /**
   * 查找用户的所有一级分类 (只返回父分类)
   */
  findParentCategories(userId: string, type?: TransactionType): Promise<Category[]>;

  /**
   * 查找某个父分类下的所有子分类
   */
  findChildCategories(parentId: string): Promise<Category[]>;

  /**
   * 检查分类名称是否已存在 (同一用户,同一类型,同一父分类下)
   */
  existsByName(
    userId: string,
    name: string,
    type: TransactionType,
    parentId?: string | null
  ): Promise<boolean>;

  /**
   * 更新分类
   */
  update(id: string, data: Partial<CreateCategoryInput>): Promise<Category>;

  /**
   * 删除分类
   * 注意: 需要检查是否有关联的交易或子分类
   */
  delete(id: string): Promise<void>;

  /**
   * 检查分类是否有关联的交易
   */
  hasTransactions(categoryId: string): Promise<boolean>;

  /**
   * 初始化默认分类 (首次使用时)
   */
  createDefaultCategories(userId: string): Promise<Category[]>;
}
