import { Category as PrismaCategory } from '@prisma/client';
import { Category, TransactionType } from '@/domain/entities';

/**
 * Category Mapper with nested relations support
 */
type PrismaCategoryWithRelations = PrismaCategory & {
  children?: PrismaCategory[];
  parent?: PrismaCategory | null;
};

export class CategoryMapper {
  static toDomain(prismaCategory: PrismaCategoryWithRelations): Category {
    return {
      id: prismaCategory.id,
      name: prismaCategory.name,
      type: prismaCategory.type as TransactionType,
      color: prismaCategory.color ?? undefined,
      icon: prismaCategory.icon ?? undefined,
      parentId: prismaCategory.parentId ?? undefined,
      userId: prismaCategory.userId,
      createdAt: prismaCategory.createdAt,
      updatedAt: prismaCategory.updatedAt,
      children: prismaCategory.children?.map((child) => CategoryMapper.toDomain(child)),
      parent: prismaCategory.parent ? CategoryMapper.toDomain(prismaCategory.parent) : undefined,
    };
  }
}
