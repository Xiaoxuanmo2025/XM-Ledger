# 🚀 快速开始指南

选择你的数据库方案,然后按步骤操作。

---

## 方案 A: 使用 Docker (本地数据库) ⭐ 推荐

### 前提条件
- ✅ 已安装 Docker Desktop
- ✅ Docker 正在运行

### 1️⃣ 安装依赖
```bash
pnpm install
```

### 2️⃣ 配置环境变量
```bash
cp .env.local.example .env
```

编辑 `.env` 文件,至少填写:
```bash
# 生成 AUTH_SECRET
openssl rand -base64 32

# 然后填写到 .env
AUTH_SECRET="生成的密钥"
AUTH_GITHUB_ID="你的 GitHub OAuth Client ID"
AUTH_GITHUB_SECRET="你的 GitHub OAuth Client Secret"
ALLOWED_USERS="your-email@example.com"
```

### 3️⃣ 启动数据库
```bash
pnpm docker:up
```

等待几秒,数据库启动完成。

### 4️⃣ 初始化数据库
```bash
pnpm db:generate
pnpm db:push
```

### 5️⃣ 启动开发服务器
```bash
pnpm dev
```

访问: http://localhost:3000

### 🛑 停止开发环境
```bash
pnpm docker:down
```

---

## 方案 B: 使用 Vercel Postgres (云端数据库)

### 优点
- ✅ 无需安装任何数据库
- ✅ 开发和生产共用
- ✅ 免费额度充足

### 1️⃣ 安装依赖
```bash
pnpm install
```

### 2️⃣ 登录 Vercel
```bash
pnpm i -g vercel
vercel login
```

### 3️⃣ 链接项目
```bash
vercel link
```

### 4️⃣ 创建数据库

1. 访问 https://vercel.com/dashboard
2. 进入你的项目 → **Storage** 标签
3. 点击 **Create Database** → 选择 **Postgres**
4. 创建后,点击 **.env.local** 标签
5. 复制 `POSTGRES_PRISMA_URL` 的值

### 5️⃣ 配置环境变量

创建 `.env` 文件:
```bash
cp .env.example .env
```

编辑 `.env`:
```bash
DATABASE_URL="postgres://default:xxx@xxx.postgres.vercel-storage.com/verceldb?sslmode=require&pgbouncer=true"
AUTH_SECRET="运行 openssl rand -base64 32 生成"
AUTH_GITHUB_ID="你的 GitHub Client ID"
AUTH_GITHUB_SECRET="你的 GitHub Client Secret"
ALLOWED_USERS="your-email@example.com"
```

### 6️⃣ 初始化数据库
```bash
pnpm db:generate
pnpm db:push
```

### 7️⃣ 启动开发服务器
```bash
pnpm dev
```

访问: http://localhost:3000

---

## 方案 C: 使用 Supabase (免费云端)

### 1️⃣ 创建 Supabase 项目

1. 访问 https://supabase.com/dashboard
2. 点击 "New Project"
3. 设置数据库密码并记住

### 2️⃣ 获取连接字符串

1. 项目创建后,进入 **Settings** → **Database**
2. 复制 **Connection string** → **URI** 格式
3. 将 `[YOUR-PASSWORD]` 替换为你的密码

### 3️⃣ 安装依赖并配置
```bash
pnpm install
cp .env.example .env
```

编辑 `.env`:
```bash
DATABASE_URL="postgresql://postgres:你的密码@db.xxx.supabase.co:5432/postgres"
AUTH_SECRET="运行 openssl rand -base64 32 生成"
AUTH_GITHUB_ID="你的 GitHub Client ID"
AUTH_GITHUB_SECRET="你的 GitHub Client Secret"
ALLOWED_USERS="your-email@example.com"
```

### 4️⃣ 初始化并启动
```bash
pnpm db:generate
pnpm db:push
pnpm dev
```

---

## 配置 GitHub OAuth

### 1. 创建 OAuth App

访问: https://github.com/settings/developers

点击 **"New OAuth App"**

### 2. 填写信息
```
Application name: XM Ledger Dev
Homepage URL: http://localhost:3000
Authorization callback URL: http://localhost:3000/api/auth/callback/github
```

### 3. 获取凭证

- 复制 **Client ID** → 填入 `.env` 的 `AUTH_GITHUB_ID`
- 生成 **Client Secret** → 填入 `AUTH_GITHUB_SECRET`

---

## 验证安装

### 检查数据库连接
```bash
pnpm db:studio
```

访问 http://localhost:5555,应该能看到数据库表。

### 启动应用
```bash
pnpm dev
```

访问 http://localhost:3000,应该看到登录页面。

---

## 常用命令

### 数据库相关
```bash
# 启动 Docker 数据库
pnpm docker:up

# 停止 Docker 数据库
pnpm docker:down

# 查看数据库日志
pnpm docker:logs

# 生成 Prisma Client
pnpm db:generate

# 推送 Schema 到数据库
pnpm db:push

# 打开数据库管理界面
pnpm db:studio
```

### 开发相关
```bash
# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 运行生产版本
pnpm start

# 代码检查
pnpm lint
```

---

## 遇到问题?

### ❌ Docker 启动失败
```bash
# 检查 Docker 是否运行
docker info

# 如果端口被占用,修改 docker-compose.yml 中的端口
# ports:
#   - "5433:5432"  # 改为 5433
```

### ❌ 数据库连接失败
```bash
# 检查连接字符串
echo $DATABASE_URL

# 测试连接
pnpm db:studio
```

### ❌ GitHub 登录失败 "AccessDenied"
- 检查你的 GitHub 邮箱是否在 `ALLOWED_USERS` 中
- 确保 callback URL 正确配置

### ❌ Prisma Client 报错
```bash
# 重新生成
pnpm db:generate
```

---

## 下一步

✅ 首次登录后,系统会自动创建默认分类
✅ 在首页创建你的第一笔交易
✅ 查看月度报表和图表
✅ 管理分类

详细文档: [SETUP.md](SETUP.md)
