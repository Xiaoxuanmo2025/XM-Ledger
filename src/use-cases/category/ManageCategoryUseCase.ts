import { Category, CreateCategoryInput, TransactionType } from '@/domain/entities';
import { InvalidTransactionError, CategoryNotFoundError } from '@/domain/errors/DomainError';
import { ICategoryRepository } from './ports';

/**
 * Manage Category Use Cases
 *
 * 包含分类的增删改查操作
 */
export class ManageCategoryUseCase {
  constructor(private categoryRepo: ICategoryRepository) {}

  /**
   * 创建分类
   */
  async create(input: CreateCategoryInput): Promise<Category> {
    // 检查名称是否已存在
    const exists = await this.categoryRepo.existsByName(
      input.userId,
      input.name,
      input.type
    );

    if (exists) {
      throw new InvalidTransactionError(
        `${input.type === TransactionType.EXPENSE ? '支出' : '收入'}分类 "${input.name}" 已存在`
      );
    }

    return this.categoryRepo.create(input);
  }

  /**
   * 获取用户的所有分类
   */
  async getByUser(userId: string, type?: TransactionType): Promise<Category[]> {
    return this.categoryRepo.findByUser(userId, type);
  }

  /**
   * 获取单个分类
   */
  async getById(id: string): Promise<Category | null> {
    return this.categoryRepo.findById(id);
  }

  /**
   * 更新分类
   */
  async update(
    id: string,
    userId: string,
    data: Partial<CreateCategoryInput>
  ): Promise<Category> {
    const category = await this.categoryRepo.findById(id);
    if (!category) {
      throw new CategoryNotFoundError('分类不存在');
    }

    if (category.userId !== userId) {
      throw new InvalidTransactionError('无权修改此分类');
    }

    // 如果修改了名称,检查是否重名
    if (data.name && data.name !== category.name) {
      const exists = await this.categoryRepo.existsByName(
        userId,
        data.name,
        category.type
      );

      if (exists) {
        throw new InvalidTransactionError(`分类名称 "${data.name}" 已存在`);
      }
    }

    return this.categoryRepo.update(id, data);
  }

  /**
   * 删除分类
   */
  async delete(id: string, userId: string): Promise<void> {
    const category = await this.categoryRepo.findById(id);
    if (!category) {
      throw new CategoryNotFoundError('分类不存在');
    }

    if (category.userId !== userId) {
      throw new InvalidTransactionError('无权删除此分类');
    }

    // TODO: 检查是否有关联的交易
    // 可以选择:
    // 1. 禁止删除有交易的分类
    // 2. 删除时将关联交易移到默认分类
    // 3. 级联删除所有交易 (不推荐)

    await this.categoryRepo.delete(id);
  }

  /**
   * 初始化默认分类 (首次登录时调用)
   */
  async initializeDefaultCategories(userId: string): Promise<Category[]> {
    return this.categoryRepo.createDefaultCategories(userId);
  }
}
