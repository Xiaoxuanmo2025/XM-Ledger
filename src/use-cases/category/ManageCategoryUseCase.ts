import { Category, CreateCategoryInput, TransactionType } from '@/domain/entities';
import { InvalidTransactionError, CategoryNotFoundError } from '@/domain/errors/DomainError';
import { ICategoryRepository } from '../ports';

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
    // 如果是子分类,验证父分类存在
    if (input.parentId) {
      const parent = await this.categoryRepo.findById(input.parentId);
      if (!parent) {
        throw new CategoryNotFoundError('父分类不存在');
      }
      if (parent.userId !== input.userId) {
        throw new InvalidTransactionError('无权使用此父分类');
      }
      if (parent.type !== input.type) {
        throw new InvalidTransactionError('父分类和子分类的类型必须一致');
      }
      if (parent.parentId) {
        throw new InvalidTransactionError('不支持三级或更多级分类');
      }
    }

    // 检查名称是否已存在 (同一用户,同一类型,同一父分类下)
    const exists = await this.categoryRepo.existsByName(
      input.userId,
      input.name,
      input.type,
      input.parentId
    );

    if (exists) {
      const prefix = input.type === TransactionType.EXPENSE ? '支出' : '收入';
      const scope = input.parentId ? '此父分类下' : '';
      throw new InvalidTransactionError(`${prefix}分类 "${input.name}" ${scope}已存在`);
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
    const category = await this.categoryRepo.findById(id, true);
    if (!category) {
      throw new CategoryNotFoundError('分类不存在');
    }

    if (category.userId !== userId) {
      throw new InvalidTransactionError('无权删除此分类');
    }

    // 检查是否有子分类
    if (category.children && category.children.length > 0) {
      throw new InvalidTransactionError('请先删除此分类下的所有子分类');
    }

    // 检查是否有关联的交易
    const hasTransactions = await this.categoryRepo.hasTransactions(id);
    if (hasTransactions) {
      throw new InvalidTransactionError('此分类下有关联的交易记录,无法删除');
    }

    await this.categoryRepo.delete(id);
  }

  /**
   * 初始化默认分类 (首次登录时调用)
   */
  async initializeDefaultCategories(userId: string): Promise<Category[]> {
    return this.categoryRepo.createDefaultCategories(userId);
  }
}
