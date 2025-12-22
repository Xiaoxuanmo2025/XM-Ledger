# XM Ledger 配置指南

## 1. 创建 GitHub OAuth App

### 步骤 1: 前往 GitHub Developer Settings

访问: https://github.com/settings/developers

点击 **"New OAuth App"**

### 步骤 2: 填写应用信息

**开发环境配置:**
```
Application name: XM Ledger Dev
Homepage URL: http://localhost:3000
Authorization callback URL: http://localhost:3000/api/auth/callback/github
```

**生产环境配置** (可以创建另一个 OAuth App 或添加多个 callback URLs):
```
Application name: XM Ledger
Homepage URL: https://your-app.vercel.app
Authorization callback URL: https://your-app.vercel.app/api/auth/callback/github
```

### 步骤 3: 获取凭证

创建后你会得到:
- **Client ID** - 复制到 `.env` 的 `AUTH_GITHUB_ID`
- **Client Secret** - 点击 "Generate a new client secret" 并复制到 `AUTH_GITHUB_SECRET`

⚠️ **注意:** Client Secret 只显示一次,请妥善保存!

---

## 2. 配置 Vercel Postgres 数据库

### 选项 A: 使用 Vercel Postgres (推荐)

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 进入你的项目 → **Storage** 标签
3. 点击 **Create Database** → 选择 **Postgres**
4. 创建完成后,点击 **Connect** 获取连接字符串
5. 复制 `DATABASE_URL` (包含 `?sslmode=require&pgbouncer=true`)

### 选项 B: 使用其他 PostgreSQL

你也可以使用:
- Supabase: https://supabase.com/
- Railway: https://railway.app/
- Neon: https://neon.tech/
- 自托管 PostgreSQL

---

## 3. 配置环境变量

### 步骤 1: 复制环境变量模板

```bash
cp .env.example .env
```

### 步骤 2: 生成 AUTH_SECRET

```bash
openssl rand -base64 32
```

将输出复制到 `.env` 的 `AUTH_SECRET`

### 步骤 3: 填写完整的 .env 文件

```bash
# Database
DATABASE_URL="postgresql://..."

# Auth.js (v5)
AUTH_SECRET="your-generated-secret-here"
AUTH_GITHUB_ID="your-github-client-id"
AUTH_GITHUB_SECRET="your-github-client-secret"

# 白名单邮箱 (逗号分隔)
ALLOWED_USERS="your-email@example.com,partner@example.com"

# 汇率 API (可选)
EXCHANGE_RATE_API_KEY=""
EXCHANGE_RATE_API_URL="https://v6.exchangerate-api.com/v6"

# Next.js
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 4. 安装依赖和初始化数据库

### 步骤 1: 安装依赖

```bash
pnpm install
```

### 步骤 2: 生成 Prisma Client

```bash
pnpm db:generate
```

### 步骤 3: 推送数据库 Schema

```bash
pnpm db:push
```

如果你想使用 migrations (生产环境推荐):

```bash
pnpm db:migrate
```

---

## 5. 启动开发服务器

```bash
pnpm dev
```

访问: http://localhost:3000

### 首次登录

1. 点击 "使用 GitHub 登录"
2. 授权应用访问你的 GitHub 账号
3. 如果你的邮箱在 `ALLOWED_USERS` 白名单中,登录成功
4. 系统会自动创建默认分类

---

## 6. 部署到 Vercel

### 步骤 1: 推送代码到 Git

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 步骤 2: 导入到 Vercel

1. 访问 [Vercel Dashboard](https://vercel.com/new)
2. 导入你的 Git 仓库
3. Vercel 会自动检测 Next.js 项目

### 步骤 3: 配置环境变量

在 Vercel 项目设置中,添加以下环境变量:

```
DATABASE_URL=postgresql://...
AUTH_SECRET=your-generated-secret
AUTH_GITHUB_ID=your-github-client-id
AUTH_GITHUB_SECRET=your-github-client-secret
ALLOWED_USERS=your-email@example.com,partner@example.com
EXCHANGE_RATE_API_KEY=your-api-key (可选)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### 步骤 4: 更新 GitHub OAuth Callback URL

回到 GitHub OAuth App 设置,添加生产环境的 callback URL:

```
https://your-app.vercel.app/api/auth/callback/github
```

### 步骤 5: 重新部署

修改 callback URL 后,在 Vercel Dashboard 点击 **Redeploy** 重新部署。

---

## 7. 汇率 API 配置 (可选)

### 免费方案: exchangerate-api.com

1. 注册: https://www.exchangerate-api.com/
2. 获取免费 API Key (1500 requests/month)
3. 添加到 `.env`:
   ```
   EXCHANGE_RATE_API_KEY=your-api-key
   ```

### 不配置 API Key

如果不配置,系统会使用 Mock 汇率服务 (固定汇率):
- USD → CNY: 7.2
- JPY → CNY: 0.05

你也可以在创建交易时手动输入汇率。

---

## 8. 白名单配置

### 添加授权用户

在 `.env` 或 Vercel 环境变量中设置:

```bash
ALLOWED_USERS="email1@example.com,email2@example.com,email3@example.com"
```

**注意:**
- 邮箱必须是 GitHub 账号的主邮箱
- 多个邮箱用英文逗号分隔
- 不在白名单的用户无法登录

---

## 9. 常见问题

### Q: 登录失败,显示 "AccessDenied"

**A:** 检查你的 GitHub 邮箱是否在 `ALLOWED_USERS` 白名单中。

### Q: 数据库连接失败

**A:**
1. 检查 `DATABASE_URL` 是否正确
2. 确保数据库允许外部连接
3. Vercel Postgres 需要添加 `?sslmode=require`

### Q: 汇率获取失败

**A:**
1. 检查 `EXCHANGE_RATE_API_KEY` 是否配置
2. 如果没有配置,系统会使用 Mock 汇率
3. 你可以在创建交易时手动输入汇率

### Q: Prisma Client 报错

**A:** 运行 `pnpm db:generate` 重新生成 Prisma Client

### Q: 如何重置数据库

**A:**
```bash
pnpm db:push --force-reset
```
⚠️ 这会删除所有数据!

---

## 10. 开发工具

### Prisma Studio (数据库可视化)

```bash
pnpm db:studio
```

访问: http://localhost:5555

### 数据库迁移 (生产环境)

```bash
# 创建迁移
pnpm db:migrate

# 应用迁移
pnpm db:migrate deploy
```

---

## 需要帮助?

如有问题,请查看:
- [Next.js 文档](https://nextjs.org/docs)
- [Auth.js 文档](https://authjs.dev/)
- [Prisma 文档](https://www.prisma.io/docs)
- [Vercel 文档](https://vercel.com/docs)
