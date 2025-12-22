# XM-Ledger

财务追踪系统 - 多币种记账应用

## 技术栈

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Vercel Postgres
- **ORM**: Prisma
- **Auth**: Auth.js v5 + GitHub OAuth
- **Charts**: Recharts

## 核心功能

- 多币种支持 (USD, JPY, CNY)
- 自动汇率转换 (交易日汇率)
- 收支分类管理
- 数据可视化报表
- 白名单邮箱访问控制

## 项目架构 (Clean Architecture)

```
src/
├── app/                  # Presentation Layer (Next.js Pages & API Routes)
├── domain/               # Enterprise Business Rules
│   ├── entities/         # Transaction, Category, ExchangeRate
│   └── errors/           # Domain-specific errors
├── use-cases/            # Application Business Rules
│   └── ports/            # Repository Interfaces
└── infrastructure/       # Frameworks & Drivers
    ├── database/         # Prisma Client
    ├── repositories/     # Repository implementations
    ├── auth/             # Auth.js config
    └── services/         # External services (Currency API)
```

## 快速开始

1. 安装依赖:
```bash
pnpm install
```

2. 配置环境变量:
```bash
cp .env.example .env
# 编辑 .env 填入你的配置
```

3. 初始化数据库:
```bash
pnpm db:generate
pnpm db:push
```

4. 启动开发服务器:
```bash
pnpm dev
```

## 数据库设计

核心表结构:

- **Transaction**: 交易记录 (含原币种金额、汇率、CNY 金额)
- **Category**: 交易分类
- **ExchangeRate**: 汇率缓存
- **User/Account/Session**: Auth.js 认证表

## License

MIT