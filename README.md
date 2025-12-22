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

## 📚 文档

- **[快速开始指南](QUICKSTART.md)** - 3 分钟快速上手
- **[完整配置指南](SETUP.md)** - 详细的部署和配置说明
- **[数据库配置](docs/DATABASE_SETUP.md)** - 多种数据库方案选择
- **[Vercel 部署指南](docs/VERCEL_DEPLOYMENT.md)** - 解决 Edge Function 大小限制

## 🚀 快速开始

### 方案 1: 使用 Docker (推荐)

```bash
# 1. 安装依赖
pnpm install

# 2. 启动数据库 (需要 Docker)
pnpm docker:up

# 3. 配置环境变量
cp .env.local.example .env
# 编辑 .env 填入 GitHub OAuth 配置

# 4. 初始化数据库
pnpm db:generate && pnpm db:push

# 5. 启动开发服务器
pnpm dev
```

### 方案 2: 使用 Vercel Postgres

```bash
# 1. 安装依赖
pnpm install

# 2. 在 Vercel 创建 Postgres 数据库
# 访问 https://vercel.com/dashboard

# 3. 配置环境变量
cp .env.example .env
# 填入 DATABASE_URL 和其他配置

# 4. 初始化数据库
pnpm db:generate && pnpm db:push

# 5. 启动开发服务器
pnpm dev
```

访问: http://localhost:3000

📖 详细步骤请查看 [QUICKSTART.md](QUICKSTART.md)

## 数据库设计

核心表结构:

- **Transaction**: 交易记录 (含原币种金额、汇率、CNY 金额)
- **Category**: 交易分类
- **ExchangeRate**: 汇率缓存
- **User/Account/Session**: Auth.js 认证表

## License

MIT