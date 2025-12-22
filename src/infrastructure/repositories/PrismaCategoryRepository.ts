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
        userId: input.userId,
      },
    });

    return CategoryMapper.toDomain(category);
  }

  async findById(id: string): Promise<Category | null> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    return category ? CategoryMapper.toDomain(category) : null;
  }

  async findByUser(userId: string, type?: TransactionType): Promise<Category[]> {
    const categories = await this.prisma.category.findMany({
      where: {
        userId,
        ...(type && { type }),
      },
      orderBy: { name: 'asc' },
    });

    return categories.map(CategoryMapper.toDomain);
  }

  async existsByName(
    userId: string,
    name: string,
    type: TransactionType
  ): Promise<boolean> {
    const category = await this.prisma.category.findFirst({
      where: {
        userId,
        name,
        type,
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

  async createDefaultCategories(userId: string): Promise<Category[]> {
    const defaultCategories = [
      // 支出分类
      { name: 'AWS 费用', type: TransactionType.EXPENSE, color: '#FF9500', icon: '☁️' },
      { name: 'Vercel 费用', type: TransactionType.EXPENSE, color: '#000000', icon: '▲' },
      { name: '服务器成本', type: TransactionType.EXPENSE, color: '#5856D6', icon: '🖥️' },
      { name: '人工成本', type: TransactionType.EXPENSE, color: '#34C759', icon: '👨‍💻' },
      { name: '其他支出', type: TransactionType.EXPENSE, color: '#8E8E93', icon: '📦' },

      // 收入分类
      { name: '项目收入', type: TransactionType.INCOME, color: '#30D158', icon: '💰' },
      { name: '服务收入', type: TransactionType.INCOME, color: '#32ADE6', icon: '🔧' },
      { name: '其他收入', type: TransactionType.INCOME, color: '#64D2FF', icon: '💼' },
    ];

    const created = await Promise.all(
      defaultCategories.map((cat) =>
        this.prisma.category.create({
          data: {
            ...cat,
            userId,
          },
        })
      )
    );

    return created.map(CategoryMapper.toDomain);
  }
}
