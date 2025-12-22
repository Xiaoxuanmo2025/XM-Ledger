# 数据库配置选项

## 选项 1: Vercel Postgres (推荐 - 无需本地安装)

### 优点
- ✅ 无需本地安装 PostgreSQL
- ✅ 开发和生产使用同一个数据库
- ✅ 自动备份和扩展
- ✅ 免费额度足够开发使用

### 步骤

1. **登录 Vercel**
   ```bash
   pnpm i -g vercel
   vercel login
   ```

2. **创建项目**
   ```bash
   vercel link
   ```

3. **创建数据库**
   - 访问 https://vercel.com/dashboard
   - 进入你的项目 → **Storage** 标签
   - 点击 **Create Database** → 选择 **Postgres**
   - 数据库名称: `xm-ledger-db`

4. **获取连接字符串**
   - 创建后点击 **.env.local** 标签
   - 复制 `POSTGRES_PRISMA_URL` 的值
   - 或者点击 **Connect** 获取

5. **配置本地环境变量**
   在 `.env` 中设置:
   ```bash
   DATABASE_URL="postgres://default:xxx@xxx.postgres.vercel-storage.com:5432/verceldb?sslmode=require&pgbouncer=true&connect_timeout=15"
   ```

6. **初始化数据库**
   ```bash
   pnpm db:generate
   pnpm db:push
   ```

7. **验证连接**
   ```bash
   pnpm db:studio
   ```
   访问 http://localhost:5555 查看数据

---

## 选项 2: Supabase (免费,功能强大)

### 优点
- ✅ 永久免费计划
- ✅ 包含数据库 + Auth + Storage
- ✅ 自带数据库管理面板

### 步骤

1. **注册 Supabase**
   访问: https://supabase.com/dashboard

2. **创建项目**
   - 点击 "New Project"
   - 项目名称: `xm-ledger`
   - 数据库密码: 自己设置并记住
   - 区域: 选择 `Northeast Asia (Tokyo)` 或其他近的区域

3. **获取连接字符串**
   - 项目创建后,进入 **Settings** → **Database**
   - 复制 **Connection string** → **URI** 格式
   - 将 `[YOUR-PASSWORD]` 替换为你设置的密码

4. **配置 .env**
   ```bash
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres"
   ```

5. **初始化数据库**
   ```bash
   pnpm db:generate
   pnpm db:push
   ```

---

## 选项 3: Docker 本地运行 PostgreSQL

### 优点
- ✅ 完全本地控制
- ✅ 无需外网连接

### 前提条件
- 安装 Docker Desktop

### 步骤

1. **创建 docker-compose.yml**
   (已为你准备好,见项目根目录)

2. **启动数据库**
   ```bash
   docker-compose up -d
   ```

3. **配置 .env**
   ```bash
   DATABASE_URL="postgresql://xmledger:xmledger123@localhost:5432/xmledger?schema=public"
   ```

4. **初始化数据库**
   ```bash
   pnpm db:generate
   pnpm db:push
   ```

5. **停止数据库**
   ```bash
   docker-compose down
   ```

---

## 选项 4: Railway (免费试用)

### 步骤

1. **注册 Railway**
   访问: https://railway.app/

2. **创建项目**
   - New Project → Provision PostgreSQL

3. **获取连接字符串**
   - 点击 PostgreSQL 服务
   - 切换到 **Variables** 标签
   - 复制 `DATABASE_URL`

4. **配置并初始化**
   ```bash
   # 在 .env 中设置 DATABASE_URL
   pnpm db:generate
   pnpm db:push
   ```

---

## 推荐方案

### 🚀 快速开始 (1 分钟)
→ **选项 1: Vercel Postgres**
- 如果你准备部署到 Vercel,直接用这个
- 开发和生产共用,数据同步方便

### 💪 功能完整 (5 分钟)
→ **选项 2: Supabase**
- 永久免费
- 功能最全
- 自带数据库管理界面

### 🏠 离线开发 (需要 Docker)
→ **选项 3: Docker**
- 完全本地运行
- 不依赖外部服务

---

## 快速决策指南

**Q: 我准备部署到 Vercel 吗?**
- 是 → 选项 1 (Vercel Postgres)
- 否 → 继续

**Q: 我安装了 Docker 吗?**
- 是 → 选项 3 (Docker)
- 否 → 选项 2 (Supabase)

---

## 遇到问题?

### 错误: "Can't reach database server"
- 检查网络连接
- 检查 DATABASE_URL 是否正确
- 如果使用云数据库,检查 IP 白名单设置

### 错误: "SSL connection required"
- 云数据库需要添加 `?sslmode=require`
- 例: `DATABASE_URL="postgres://...?sslmode=require"`

### 错误: "Database does not exist"
- 运行 `pnpm db:push` 创建数据库表
