# 项目结构说明

## 📁 完整目录树

```
XM-Ledger/
├── docs/                           # 📚 文档目录
│   ├── DATABASE_SETUP.md          # 数据库配置指南
│   └── PROJECT_STRUCTURE.md       # 本文件
├── prisma/                         # 🗄️ Prisma 配置
│   └── schema.prisma              # 数据库模型定义
├── scripts/                        # 🔧 开发脚本
│   ├── start-dev.sh               # 启动开发环境
│   └── stop-dev.sh                # 停止开发环境
├── src/                           # 📦 源代码 (Clean Architecture)
│   ├── app/                       # ▶️ Presentation Layer (Next.js 15)
│   │   ├── api/
│   │   │   └── auth/[...nextauth]/route.ts  # Auth.js API 路由
│   │   ├── auth/
│   │   │   ├── signin/page.tsx    # 登录页面
│   │   │   └── error/page.tsx     # 认证错误页面
│   │   ├── dashboard/             # 主应用页面
│   │   │   ├── components/        # 组件
│   │   │   │   ├── TransactionForm.tsx    # 交易表单
│   │   │   │   ├── StatsCard.tsx          # 统计卡片
│   │   │   │   └── MonthlyChart.tsx       # 月度图表
│   │   │   ├── categories/page.tsx        # 分类管理页
│   │   │   ├── transactions/page.tsx      # 交易记录页
│   │   │   ├── layout.tsx         # Dashboard 布局
│   │   │   ├── page.tsx           # Dashboard 首页
│   │   │   └── actions.ts         # Server Actions
│   │   ├── layout.tsx             # 根布局
│   │   ├── page.tsx               # 首页 (重定向)
│   │   └── globals.css            # 全局样式
│   ├── domain/                    # 🎯 Domain Layer (业务规则)
│   │   ├── entities/              # 实体定义
│   │   │   ├── Currency.ts        # 币种枚举
│   │   │   ├── TransactionType.ts # 交易类型
│   │   │   ├── Transaction.ts     # 交易实体
│   │   │   ├── Category.ts        # 分类实体
│   │   │   ├── ExchangeRate.ts    # 汇率实体
│   │   │   └── index.ts           # 统一导出
│   │   └── errors/                # 领域错误
│   │       └── DomainError.ts     # 自定义错误类型
│   ├── use-cases/                 # 📋 Use Cases Layer (应用逻辑)
│   │   ├── ports/                 # 接口定义 (依赖倒置)
│   │   │   ├── ITransactionRepository.ts
│   │   │   ├── ICategoryRepository.ts
│   │   │   ├── IExchangeRateRepository.ts
│   │   │   ├── ICurrencyExchangeService.ts
│   │   │   └── index.ts
│   │   ├── transaction/           # 交易相关用例
│   │   │   ├── CreateTransactionUseCase.ts
│   │   │   ├── GetTransactionsUseCase.ts
│   │   │   ├── UpdateTransactionUseCase.ts
│   │   │   ├── DeleteTransactionUseCase.ts
│   │   │   └── index.ts
│   │   ├── category/              # 分类相关用例
│   │   │   ├── ManageCategoryUseCase.ts
│   │   │   └── index.ts
│   │   ├── report/                # 报表相关用例
│   │   │   ├── GetMonthlyReportUseCase.ts
│   │   │   └── index.ts
│   │   └── index.ts               # 统一导出
│   └── infrastructure/            # 🔌 Infrastructure Layer (框架实现)
│       ├── database/              # 数据库
│       │   ├── prisma.ts          # Prisma Client 单例
│       │   └── index.ts
│       ├── repositories/          # Repository 实现
│       │   ├── mappers/           # 数据映射器
│       │   │   ├── TransactionMapper.ts
│       │   │   ├── CategoryMapper.ts
│       │   │   └── ExchangeRateMapper.ts
│       │   ├── PrismaTransactionRepository.ts
│       │   ├── PrismaCategoryRepository.ts
│       │   ├── PrismaExchangeRateRepository.ts
│       │   └── index.ts
│       ├── services/              # 外部服务
│       │   ├── ExchangeRateApiService.ts    # 真实 API
│       │   ├── MockExchangeRateService.ts   # Mock 服务
│       │   └── index.ts
│       ├── auth/                  # 认证配置
│       │   ├── auth.config.ts     # Auth.js 配置
│       │   ├── auth.ts            # Auth.js 实例
│       │   └── index.ts
│       └── index.ts               # 统一导出
├── .env.example                   # 环境变量模板 (生产)
├── .env.local.example             # 环境变量模板 (Docker 本地)
├── .gitignore                     # Git 忽略文件
├── .npmrc                         # pnpm 配置
├── docker-compose.yml             # Docker 配置
├── middleware.ts                  # Next.js 中间件 (路由保护)
├── next.config.ts                 # Next.js 配置
├── package.json                   # 项目依赖
├── pnpm-workspace.yaml            # pnpm workspace
├── postcss.config.mjs             # PostCSS 配置
├── QUICKSTART.md                  # 快速开始指南 ⭐
├── README.md                      # 项目介绍
├── SETUP.md                       # 完整配置指南
├── tailwind.config.ts             # Tailwind 配置
└── tsconfig.json                  # TypeScript 配置
```

---

## 🏗️ Clean Architecture 分层说明

### 1️⃣ Domain Layer (领域层)
**位置**: `src/domain/`
**职责**: 定义业务实体和规则,不依赖任何框架

- **entities/**: 纯业务对象 (Transaction, Category, Currency 等)
- **errors/**: 领域特定错误

**原则**: 这一层是整个架构的核心,不依赖外层任何东西

---

### 2️⃣ Use Cases Layer (用例层)
**位置**: `src/use-cases/`
**职责**: 应用程序特定的业务逻辑

- **ports/**: 定义接口 (Repository, Service)
- **transaction/**: 交易相关业务逻辑
  - `CreateTransactionUseCase` - 创建交易 + 汇率转换
  - `UpdateTransactionUseCase` - 更新交易
  - `DeleteTransactionUseCase` - 删除交易
- **category/**: 分类管理逻辑
- **report/**: 报表生成逻辑
  - `GetMonthlyReportUseCase` - 月度财务报表

**原则**: 依赖 Domain Layer,定义 Ports (接口),不依赖具体实现

---

### 3️⃣ Infrastructure Layer (基础设施层)
**位置**: `src/infrastructure/`
**职责**: 框架和工具的具体实现

- **database/**: Prisma Client 配置
- **repositories/**: Repository 接口的 Prisma 实现
  - `PrismaTransactionRepository`
  - `PrismaCategoryRepository`
  - `PrismaExchangeRateRepository`
- **services/**: 外部服务
  - `ExchangeRateApiService` - 汇率 API 调用
  - `MockExchangeRateService` - Mock 数据
- **auth/**: Auth.js 认证配置

**原则**: 实现 Use Cases 定义的 Ports,可以随时替换实现

---

### 4️⃣ Presentation Layer (展示层)
**位置**: `src/app/`
**职责**: Next.js 页面和 API 路由

- **dashboard/**: 主应用
  - `page.tsx` - 首页 (统计 + 图表)
  - `components/` - UI 组件
  - `actions.ts` - Server Actions (调用 Use Cases)
- **auth/**: 认证页面
- **api/**: API 路由

**原则**: 调用 Use Cases,处理用户输入和展示

---

## 📊 数据流向

```
用户操作 (UI)
    ↓
Server Actions (app/dashboard/actions.ts)
    ↓
Use Cases (use-cases/transaction/CreateTransactionUseCase.ts)
    ↓
Repository Interface (use-cases/ports/ITransactionRepository.ts)
    ↓
Repository Implementation (infrastructure/repositories/PrismaTransactionRepository.ts)
    ↓
Database (Prisma Client → PostgreSQL)
```

---

## 🔑 核心文件说明

### 汇率转换核心逻辑
**文件**: [src/use-cases/transaction/CreateTransactionUseCase.ts](../src/use-cases/transaction/CreateTransactionUseCase.ts)

```typescript
private async getExchangeRate(input: CreateTransactionInput): Promise<Decimal> {
  // 1. CNY → 汇率 = 1
  if (input.currency === Currency.CNY) return new Decimal(1);

  // 2. 用户手动提供 → 直接使用
  if (input.exchangeRate) return new Decimal(input.exchangeRate);

  // 3. 数据库缓存 → 使用缓存
  const cached = await this.exchangeRateRepo.findByDateAndCurrency(...);
  if (cached) return cached.rate;

  // 4. 外部 API → 获取并缓存
  const rate = await this.currencyService.getRate(...);
  if (rate) {
    await this.exchangeRateRepo.upsert(...); // 缓存
    return new Decimal(rate);
  }

  // 5. 失败 → 抛异常
  throw new ExchangeRateNotFoundError('请手动输入汇率');
}
```

### 认证与授权
**文件**: [src/infrastructure/auth/auth.config.ts](../src/infrastructure/auth/auth.config.ts)

- GitHub OAuth 配置
- 邮箱白名单验证
- Session 管理

### 数据库模型
**文件**: [prisma/schema.prisma](../prisma/schema.prisma)

核心表:
- `Transaction` - 交易记录 (含汇率)
- `Category` - 分类
- `ExchangeRate` - 汇率缓存
- `User/Account/Session` - Auth.js 认证

---

## 🎨 UI 组件结构

### TransactionForm
**文件**: [src/app/dashboard/components/TransactionForm.tsx](../src/app/dashboard/components/TransactionForm.tsx)

- 收入/支出类型切换
- 分类选择 (动态过滤)
- 多币种选择
- 汇率输入 (条件显示)

### MonthlyChart
**文件**: [src/app/dashboard/components/MonthlyChart.tsx](../src/app/dashboard/components/MonthlyChart.tsx)

- Recharts 饼图
- 分类占比显示
- 详细数据列表

---

## 🔧 开发工具配置

### Docker
**文件**: [docker-compose.yml](../docker-compose.yml)

PostgreSQL 16 Alpine 容器配置

### Scripts
- `scripts/start-dev.sh` - 一键启动开发环境
- `scripts/stop-dev.sh` - 停止并清理

---

## 📝 配置文件

| 文件 | 说明 |
|------|------|
| `.env.example` | 生产环境变量模板 |
| `.env.local.example` | Docker 本地开发模板 |
| `tsconfig.json` | TypeScript 配置 + Path 别名 |
| `tailwind.config.ts` | Tailwind 样式配置 |
| `next.config.ts` | Next.js 配置 |
| `prisma/schema.prisma` | 数据库模型 |

---

## 🚀 部署相关

### Vercel 部署
1. 推送代码到 GitHub
2. 导入到 Vercel
3. 配置环境变量
4. 自动部署

详见: [SETUP.md](../SETUP.md)

---

## 📚 参考文档

- [Next.js 15 文档](https://nextjs.org/docs)
- [Auth.js 文档](https://authjs.dev/)
- [Prisma 文档](https://www.prisma.io/docs)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
