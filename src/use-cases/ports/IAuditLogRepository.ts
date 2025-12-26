import { AuditLog, CreateAuditLogInput, AuditAction } from '@/domain/entities';

/**
 * AuditLog Repository Interface (Port)
 *
 * 定义审计日志数据访问的抽象接口
 */
export interface IAuditLogRepository {
  /**
   * 创建审计日志
   */
  create(input: CreateAuditLogInput): Promise<AuditLog>;

  /**
   * 查找所有审计日志
   */
  findAll(filters?: AuditLogFilters): Promise<AuditLog[]>;

  /**
   * 查找特定实体的审计日志
   */
  findByEntity(entityType: string, entityId: string): Promise<AuditLog[]>;

  /**
   * 查找特定操作类型的审计日志
   */
  findByAction(action: AuditAction, filters?: AuditLogFilters): Promise<AuditLog[]>;

  /**
   * 根据 ID 查找审计日志
   */
  findById(id: string): Promise<AuditLog | null>;
}

/**
 * 审计日志查询过滤条件
 */
export interface AuditLogFilters {
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}
