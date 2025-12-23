import { PrismaClient } from '@prisma/client';
import { Category, CreateCategoryInput, TransactionType } from '@/domain/entities';
import { ICategoryRepository } from '@/use-cases/ports';
import { CategoryMapper } from './mappers/CategoryMapper';

/**
 * Prisma Category Repository Implementation
 */
export class PrismaCategoryRepository implements ICategoryRepository {
  constructor(private prisma: PrismaClient) {}

  async create(input: CreateCategoryInput): Promise<Category> {
    const category = await this.prisma.category.create({
      data: {
        name: input.name,
        type: input.type,
        color: input.color,
        icon: input.icon,
        parentId: input.parentId,
        userId: input.userId,
      },
      include: {
        children: true,
        parent: true,
      },
    });

    return CategoryMapper.toDomain(category);
  }

  async findById(id: string, includeChildren = false): Promise<Category | null> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        children: includeChildren,
        parent: true,
      },
    });

    return category ? CategoryMapper.toDomain(category) : null;
  }

  async findByUser(userId: string, type?: TransactionType): Promise<Category[]> {
    const categories = await this.prisma.category.findMany({
      where: {
        userId,
        ...(type && { type }),
      },
      include: {
        children: {
          orderBy: { name: 'asc' },
        },
        parent: true,
      },
      orderBy: [{ parentId: 'asc' }, { name: 'asc' }],
    });

    return categories.map(CategoryMapper.toDomain);
  }

  async findParentCategories(userId: string, type?: TransactionType): Promise<Category[]> {
    const categories = await this.prisma.category.findMany({
      where: {
        userId,
        parentId: null,
        ...(type && { type }),
      },
      include: {
        children: {
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    return categories.map(CategoryMapper.toDomain);
  }

  async findChildCategories(parentId: string): Promise<Category[]> {
    const categories = await this.prisma.category.findMany({
      where: { parentId },
      orderBy: { name: 'asc' },
    });

    return categories.map(CategoryMapper.toDomain);
  }

  async existsByName(
    userId: string,
    name: string,
    type: TransactionType,
    parentId?: string | null
  ): Promise<boolean> {
    const category = await this.prisma.category.findFirst({
      where: {
        userId,
        name,
        type,
        parentId: parentId === undefined ? undefined : parentId,
      },
    });

    return category !== null;
  }

  async update(id: string, data: Partial<CreateCategoryInput>): Promise<Category> {
    const category = await this.prisma.category.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.type && { type: data.type }),
        ...(data.color !== undefined && { color: data.color }),
        ...(data.icon !== undefined && { icon: data.icon }),
      },
    });

    return CategoryMapper.toDomain(category);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.category.delete({
      where: { id },
    });
  }

  async hasTransactions(categoryId: string): Promise<boolean> {
    const count = await this.prisma.transaction.count({
      where: { categoryId },
    });

    return count > 0;
  }

  async createDefaultCategories(userId: string): Promise<Category[]> {
    // 创建父分类和子分类的两级结构
    const parentCategories = [
      // 支出父分类
      { name: '工资', type: TransactionType.EXPENSE, color: '#34C759', icon: '💰' },
      { name: '云服务', type: TransactionType.EXPENSE, color: '#FF9500', icon: '☁️' },
      { name: '运营成本', type: TransactionType.EXPENSE, color: '#5856D6', icon: '🏢' },
      { name: '其他支出', type: TransactionType.EXPENSE, color: '#8E8E93', icon: '📦' },

      // 收入父分类
      { name: '项目收入', type: TransactionType.INCOME, color: '#30D158', icon: '💼' },
      { name: '服务收入', type: TransactionType.INCOME, color: '#32ADE6', icon: '🔧' },
      { name: '其他收入', type: TransactionType.INCOME, color: '#64D2FF', icon: '🎁' },
    ];

    const createdParents = await Promise.all(
      parentCategories.map((cat) =>
        this.prisma.category.create({
          data: {
            ...cat,
            userId,
          },
        })
      )
    );

    // 创建子分类
    const childCategories = [
      // 工资子分类
      { name: '月薪', parentName: '工资', type: TransactionType.EXPENSE, color: '#34C759' },
      { name: '奖金', parentName: '工资', type: TransactionType.EXPENSE, color: '#34C759' },

      // 云服务子分类
      { name: 'AWS', parentName: '云服务', type: TransactionType.EXPENSE, color: '#FF9500' },
      { name: 'Vercel', parentName: '云服务', type: TransactionType.EXPENSE, color: '#000000' },
      { name: 'Supabase', parentName: '云服务', type: TransactionType.EXPENSE, color: '#3ECF8E' },

      // 运营成本子分类
      { name: '办公用品', parentName: '运营成本', type: TransactionType.EXPENSE, color: '#5856D6' },
      { name: '差旅费', parentName: '运营成本', type: TransactionType.EXPENSE, color: '#5856D6' },
    ];

    const createdChildren = await Promise.all(
      childCategories.map((cat) => {
        const parent = createdParents.find(
          (p) => p.name === cat.parentName && p.type === cat.type
        );
        return this.prisma.category.create({
          data: {
            name: cat.name,
            type: cat.type,
            color: cat.color,
            userId,
            parentId: parent?.id,
          },
        });
      })
    );

    const allCategories = [...createdParents, ...createdChildren];
    return allCategories.map(CategoryMapper.toDomain);
  }
}
