/**
 * Use Cases (Application Business Rules)
 *
 * 这一层包含应用程序特定的业务规则
 * Use Cases 协调 Entity 之间的数据流动,并指挥这些 Entity 使用其业务规则来实现用例目标
 *
 * 依赖关系:
 * - Use Cases 依赖 Domain Entities (内层)
 * - Use Cases 定义 Ports (Repository Interfaces)
 * - Infrastructure 层实现这些 Ports
 *
 * 目录结构:
 * - ports/         - Repository 和 Service 接口定义
 * - transaction/   - 交易相关 Use Cases
 * - category/      - 分类相关 Use Cases
 * - report/        - 报表相关 Use Cases
 */

// Ports (Interfaces)
export * from './ports';

// Transaction Use Cases
export * from './transaction';

// Category Use Cases
export * from './category';

// Report Use Cases
export * from './report';
