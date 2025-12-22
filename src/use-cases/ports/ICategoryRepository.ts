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
   * 根据 ID 查找分类
   */
  findById(id: string): Promise<Category | null>;

  /**
   * 查找用户的所有分类
   */
  findByUser(userId: string, type?: TransactionType): Promise<Category[]>;

  /**
   * 检查分类名称是否已存在 (同一用户,同一类型下)
   */
  existsByName(userId: string, name: string, type: TransactionType): Promise<boolean>;

  /**
   * 更新分类
   */
  update(id: string, data: Partial<CreateCategoryInput>): Promise<Category>;

  /**
   * 删除分类
   * 注意: 需要检查是否有关联的交易
   */
  delete(id: string): Promise<void>;

  /**
   * 初始化默认分类 (首次使用时)
   */
  createDefaultCategories(userId: string): Promise<Category[]>;
}
