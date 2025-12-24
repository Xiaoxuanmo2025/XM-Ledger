import { AuditLog } from '@/domain/entities';
import { AuditLog as PrismaAuditLog, AuditAction as PrismaAuditAction } from '@prisma/client';

/**
 * Mapper: Prisma AuditLog ↔ Domain AuditLog
 */
export class AuditLogMapper {
  static toDomain(prismaLog: PrismaAuditLog & { user?: { id: string; name: string | null; email: string | null } | null }): AuditLog {
    return {
      id: prismaLog.id,
      action: prismaLog.action as any, // Prisma enum 转换为 domain enum
      userId: prismaLog.userId,
      entityType: prismaLog.entityType ?? undefined,
      entityId: prismaLog.entityId ?? undefined,
      details: prismaLog.details ?? undefined,
      ipAddress: prismaLog.ipAddress ?? undefined,
      userAgent: prismaLog.userAgent ?? undefined,
      createdAt: prismaLog.createdAt,
      user: prismaLog.user
        ? {
            id: prismaLog.user.id,
            name: prismaLog.user.name ?? undefined,
            email: prismaLog.user.email ?? undefined,
          }
        : undefined,
    };
  }

  static toPrisma(domainLog: AuditLog): PrismaAuditLog {
    return {
      id: domainLog.id,
      action: domainLog.action as PrismaAuditAction,
      userId: domainLog.userId,
      entityType: domainLog.entityType ?? null,
      entityId: domainLog.entityId ?? null,
      details: domainLog.details ?? null,
      ipAddress: domainLog.ipAddress ?? null,
      userAgent: domainLog.userAgent ?? null,
      createdAt: domainLog.createdAt,
    };
  }
}
