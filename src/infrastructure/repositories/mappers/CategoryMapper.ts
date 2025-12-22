import { Category as PrismaCategory } from '@prisma/client';
import { Category, TransactionType } from '@/domain/entities';

/**
 * Category Mapper
 */
export class CategoryMapper {
  static toDomain(prismaCategory: PrismaCategory): Category {
    return {
      id: prismaCategory.id,
      name: prismaCategory.name,
      type: prismaCategory.type as TransactionType,
      color: prismaCategory.color ?? undefined,
      icon: prismaCategory.icon ?? undefined,
      userId: prismaCategory.userId,
      createdAt: prismaCategory.createdAt,
      updatedAt: prismaCategory.updatedAt,
    };
  }
}
