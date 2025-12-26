import { PrismaClient } from '@prisma/client';
import { AuditLog, CreateAuditLogInput } from '@/domain/entities';
import { IAuditLogRepository, AuditLogFilters } from '@/use-cases/ports';
import { AuditLogMapper } from './mappers/AuditLogMapper';

/**
 * Prisma AuditLog Repository Implementation
 */
export class PrismaAuditLogRepository implements IAuditLogRepository {
  constructor(private prisma: PrismaClient) {}

  async create(input: CreateAuditLogInput): Promise<AuditLog> {
    const auditLog = await this.prisma.auditLog.create({
      data: {
        action: input.action,
        userId: input.userId,
        entityType: input.entityType,
        entityId: input.entityId,
        details: input.details ? JSON.stringify(input.details) : undefined,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      },
    });

    return AuditLogMapper.toDomain(auditLog);
  }

  async findAll(filters?: AuditLogFilters): Promise<AuditLog[]> {
    const logs = await this.prisma.auditLog.findMany({
      where: {
        ...(filters?.startDate &&
          filters?.endDate && {
            createdAt: {
              gte: filters.startDate,
              lte: filters.endDate,
            },
          }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: filters?.limit,
      skip: filters?.offset,
    });

    return logs.map(AuditLogMapper.toDomain);
  }

  async findByEntity(entityType: string, entityId: string): Promise<AuditLog[]> {
    const logs = await this.prisma.auditLog.findMany({
      where: {
        entityType,
        entityId,
      },
      orderBy: { createdAt: 'desc' },
    });

    return logs.map(AuditLogMapper.toDomain);
  }

  async findByAction(action: any, filters?: AuditLogFilters): Promise<AuditLog[]> {
    const logs = await this.prisma.auditLog.findMany({
      where: {
        action,
        ...(filters?.startDate &&
          filters?.endDate && {
            createdAt: {
              gte: filters.startDate,
              lte: filters.endDate,
            },
          }),
      },
      orderBy: { createdAt: 'desc' },
      take: filters?.limit,
      skip: filters?.offset,
    });

    return logs.map(AuditLogMapper.toDomain);
  }

  async findById(id: string): Promise<AuditLog | null> {
    const log = await this.prisma.auditLog.findUnique({
      where: { id },
    });

    return log ? AuditLogMapper.toDomain(log) : null;
  }
}
