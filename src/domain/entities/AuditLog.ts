/**
 * Domain Entity: 审计日志
 *
 * 用于记录所有关键操作,防止做假账
 */

export enum AuditAction {
  CREATE_TRANSACTION = 'CREATE_TRANSACTION',
  DELETE_TRANSACTION = 'DELETE_TRANSACTION',
  IMPORT_TRANSACTIONS = 'IMPORT_TRANSACTIONS',
  EXPORT_TRANSACTIONS = 'EXPORT_TRANSACTIONS',
}

export interface AuditLog {
  id: string;
  action: AuditAction;
  userId: string;

  // 操作详情
  entityType?: string; // 操作的实体类型 (如 "Transaction")
  entityId?: string; // 操作的实体ID
  details?: string; // JSON格式的详细信息

  // 元数据
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;

  // 关联的操作人信息 (可选,用于显示)
  user?: {
    id: string;
    name?: string;
    email?: string;
  };
}

/**
 * 创建审计日志的输入数据
 */
export interface CreateAuditLogInput {
  action: AuditAction;
  userId: string;
  entityType?: string;
  entityId?: string;
  details?: Record<string, any>; // 对象格式,会自动转换为JSON字符串
  ipAddress?: string;
  userAgent?: string;
}
