# XM-Ledger

公司内部财务追踪系统 - 支持多币种记账和自动汇率转换

## ✨ 功能特性

- 📊 **两级分类系统** - 父子分类管理（如：工资 → 月薪/奖金）
- 💱 **多币种支持** - USD、JPY、CNY，自动汇率转换
- 📈 **数据可视化** - 月度报表、分类统计图表
- 📤 **CSV 导入导出** - 批量导入交易，一键导出备份
- 🔐 **GitHub OAuth** - 邮箱白名单访问控制
- 🏗️ **Clean Architecture** - 清晰的分层架构，易于维护

## 🛠️ 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **数据库**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **认证**: Auth.js v5
- **样式**: Tailwind CSS
- **图表**: Recharts

## 📁 项目架构

```
src/
├── app/                    # 表现层 (Next.js Pages & Components)
├── domain/                 # 领域层 (实体、业务规则)
├── use-cases/              # 用例层 (业务逻辑)
└── infrastructure/         # 基础设施层 (数据库、外部服务)
```

## 🚀 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

创建 `.env` 文件：

```bash
# 数据库连接 (Supabase)
DATABASE_URL="postgresql://...@...pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://...@...pooler.supabase.com:5432/postgres"

# Auth.js
AUTH_SECRET="生成方式: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

# GitHub OAuth (https://github.com/settings/developers)
AUTH_GITHUB_ID="your-github-client-id"
AUTH_GITHUB_SECRET="your-github-client-secret"

# 邮箱白名单 (逗号分隔)
ALLOWED_USERS="user1@example.com,user2@example.com"
```

### 3. 初始化数据库

```bash
pnpm db:generate  # 生成 Prisma Client
pnpm db:push      # 同步数据库 Schema
```

### 4. 启动开发服务器

```bash
pnpm dev
```

访问: http://localhost:3000

## 📦 部署到 Vercel

### 1. 推送代码到 GitHub

```bash
git add .
git commit -m "Initial commit"
git push
```

### 2. 在 Vercel 导入项目

访问 [vercel.com](https://vercel.com) 并导入你的 GitHub 仓库

### 3. 配置环境变量

在 Vercel 项目设置中添加所有环境变量（参考上面的 `.env` 示例）

**重要**: 确保添加 `DATABASE_URL` 和 `DIRECT_URL`

### 4. 部署前初始化数据库

在本地连接到生产数据库运行：

```bash
pnpm db:push
```

### 5. 部署

Vercel 会自动构建和部署。`package.json` 已配置好自动生成 Prisma Client。

## 📋 CSV 导入导出格式

### 导出格式

```csv
日期,类型,一级分类,二级分类,描述,原始金额,币种,汇率,人民币金额,备注
2024-01-15,支出,云服务,AWS,EC2服务器,100.50,USD,7.2000,723.60,1月账单
```

### 导入格式

**必填字段**: 日期、类型、一级分类、原始金额、币种
**可选字段**: 二级分类、描述、汇率、备注

```csv
日期,类型,一级分类,二级分类,描述,原始金额,币种,汇率,备注
2024-01-15,支出,云服务,AWS,EC2服务器,100.50,USD,,1月账单
```

## 🗄️ 数据库设计

### 核心表结构

- **Transaction** - 交易记录
  - 支持多币种，自动计算 CNY 金额
  - 关联分类、用户

- **Category** - 两级分类
  - 父分类（parentId = null）
  - 子分类（parentId 指向父分类）

- **ExchangeRate** - 汇率缓存
  - 按日期和币种缓存汇率

- **User/Account/Session** - Auth.js 认证

## 🔧 常用命令

```bash
# 开发
pnpm dev                # 启动开发服务器
pnpm build              # 构建生产版本
pnpm start              # 启动生产服务器

# 数据库
pnpm db:generate        # 生成 Prisma Client
pnpm db:push            # 同步 Schema (开发环境)
pnpm db:migrate         # 创建迁移文件 (生产环境)
pnpm db:studio          # 打开数据库管理界面
```

## ⚙️ 关键配置

### package.json

构建脚本已配置自动生成 Prisma Client：

```json
{
  "scripts": {
    "build": "prisma generate && next build"
  }
}
```

### Prisma Schema

支持两级分类的 self-relation：

```prisma
model Category {
  id       String     @id @default(cuid())
  name     String
  parentId String?
  parent   Category?  @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children Category[] @relation("CategoryHierarchy")
  // ...
}
```

## 🐛 常见问题

### Vercel 部署失败 - "parentId does not exist"

**原因**: Prisma Client 未更新

**解决**:
1. 确保 `build` 脚本包含 `prisma generate`
2. 推送最新的 `prisma/schema.prisma` 到 Git
3. 在 Vercel 重新部署

### 数据库连接超时

**原因**: 使用了错误的连接端口

**解决**:
- 运行时使用 `DATABASE_URL` (port 6543 - Pooler)
- 迁移使用 `DIRECT_URL` (port 5432 - Direct)

### GitHub OAuth 回调失败

**解决**:
1. 检查 GitHub OAuth 应用的 Callback URL
2. 本地: `http://localhost:3000/api/auth/callback/github`
3. 生产: `https://your-app.vercel.app/api/auth/callback/github`

## 📄 License

MIT
