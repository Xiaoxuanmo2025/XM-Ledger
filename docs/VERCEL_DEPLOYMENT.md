# Vercel 部署指南

## Edge Function 大小限制问题

### 问题说明
Vercel 的 Edge Function (包括 Next.js Middleware) 有 1MB 的大小限制。Auth.js 配合 Prisma Adapter 会超过这个限制。

### 解决方案

我们采用了 **轻量级中间件 + Server Component 认证** 的方案:

#### 1. 中间件只做 Cookie 检查
[src/middleware.ts](../src/middleware.ts) 只检查 session cookie 是否存在:

```typescript
// 轻量级检查,不加载 Prisma 或完整的 Auth.js
const sessionToken =
  request.cookies.get('next-auth.session-token') ||
  request.cookies.get('__Secure-next-auth.session-token');

if (pathname.startsWith('/dashboard') && !sessionToken) {
  return NextResponse.redirect('/auth/signin');
}
```

**大小**: ~10KB (远小于 1MB 限制)

#### 2. Server Component 做完整验证
每个受保护的页面在 Server Component 中调用 `auth()`:

```typescript
// src/app/dashboard/layout.tsx
export default async function DashboardLayout() {
  const session = await auth(); // 完整的认证检查

  if (!session?.user) {
    redirect('/auth/signin');
  }

  // ...
}
```

### 优点

✅ **中间件极小**: 只有基础的 Next.js 依赖
✅ **安全性不变**: Server Component 中仍做完整验证
✅ **用户体验好**: 未登录用户立即被重定向
✅ **符合 Next.js 最佳实践**: https://nextjs.org/docs/app/building-your-application/authentication

---

## 部署步骤

### 1. 准备 GitHub 仓库

```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 2. 导入到 Vercel

1. 访问 [Vercel Dashboard](https://vercel.com/new)
2. 点击 **Import Project**
3. 选择你的 GitHub 仓库
4. Vercel 会自动检测 Next.js 项目

### 3. 创建 Postgres 数据库

1. 进入项目 → **Storage** 标签
2. 点击 **Create Database** → 选择 **Postgres**
3. 数据库名称: `xm-ledger-prod`
4. 区域: 选择离你最近的区域

### 4. 配置环境变量

在 Vercel 项目设置中添加环境变量:

#### 必需变量

```bash
# Database (从 Vercel Postgres 自动注入)
POSTGRES_PRISMA_URL=postgresql://...
DATABASE_URL=${POSTGRES_PRISMA_URL}

# Auth.js
AUTH_SECRET=<运行 openssl rand -base64 32 生成>
AUTH_GITHUB_ID=<GitHub OAuth Client ID>
AUTH_GITHUB_SECRET=<GitHub OAuth Client Secret>

# 白名单
ALLOWED_USERS=email1@example.com,email2@example.com

# 应用 URL
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

#### 可选变量

```bash
# 汇率 API (可选)
EXCHANGE_RATE_API_KEY=<你的 API Key>
EXCHANGE_RATE_API_URL=https://v6.exchangerate-api.com/v6
```

### 5. 初始化数据库

部署完成后,运行数据库迁移:

**方法 A: 使用 Vercel CLI**

```bash
# 安装 Vercel CLI
pnpm i -g vercel

# 登录
vercel login

# 链接项目
vercel link

# 拉取环境变量
vercel env pull

# 运行迁移
pnpm db:push
```

**方法 B: 通过本地连接**

1. 在 Vercel Dashboard 复制 `DATABASE_URL`
2. 在本地 `.env` 中设置
3. 运行 `pnpm db:push`

### 6. 更新 GitHub OAuth Callback URL

回到 GitHub OAuth App 设置:

1. 访问 https://github.com/settings/developers
2. 选择你的 OAuth App
3. 在 **Authorization callback URL** 中添加:
   ```
   https://your-app.vercel.app/api/auth/callback/github
   ```
4. 保存

你可以同时保留开发环境的 callback URL:
```
http://localhost:3000/api/auth/callback/github
https://your-app.vercel.app/api/auth/callback/github
```

### 7. 重新部署

修改 GitHub OAuth 配置后,在 Vercel Dashboard 点击 **Redeploy**。

---

## 验证部署

### 1. 检查构建日志
查看 Vercel 部署日志,确认没有错误。

### 2. 测试认证流程
1. 访问你的应用 URL
2. 尝试登录
3. 检查白名单功能是否正常

### 3. 测试功能
- ✅ 登录/登出
- ✅ 创建交易
- ✅ 查看报表
- ✅ 多币种转换

---

## 常见问题

### Q: 部署后显示 "Edge Function size exceeded"
**A**: 确保使用了我们优化后的 `middleware.ts`,它只有几 KB。

### Q: 数据库连接失败
**A**:
1. 检查 `DATABASE_URL` 是否正确配置
2. 确保使用了 Vercel Postgres 提供的连接字符串
3. 连接字符串应该包含 `?sslmode=require&pgbouncer=true`

### Q: GitHub 登录失败
**A**:
1. 检查 callback URL 是否正确
2. 确保 `AUTH_GITHUB_ID` 和 `AUTH_GITHUB_SECRET` 正确
3. 检查 `AUTH_SECRET` 是否设置

### Q: 白名单不生效
**A**: 检查 `ALLOWED_USERS` 环境变量是否正确配置,邮箱之间用逗号分隔。

### Q: 如何查看生产环境日志?
**A**:
1. Vercel Dashboard → 你的项目 → **Logs** 标签
2. 可以实时查看请求日志和错误

---

## 性能优化

### 1. 启用 Vercel Analytics
```bash
pnpm add @vercel/analytics
```

在 `src/app/layout.tsx` 中添加:
```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 2. 启用 Vercel Speed Insights
```bash
pnpm add @vercel/speed-insights
```

### 3. 配置 ISR (Incremental Static Regeneration)
对于不经常变化的页面,可以启用 ISR:

```typescript
export const revalidate = 3600; // 1 小时重新生成
```

---

## 监控和维护

### 数据库备份
Vercel Postgres 自动备份,但建议定期导出:

```bash
# 使用 Vercel CLI
vercel env pull
pnpm prisma db pull
```

### 更新依赖
定期更新依赖以获取安全补丁:

```bash
pnpm update
```

---

## 回滚部署

如果新部署有问题:

1. Vercel Dashboard → **Deployments**
2. 找到上一个正常的部署
3. 点击 **...** → **Promote to Production**

---

## 成本估算

### Vercel 免费计划
- ✅ 无限部署
- ✅ 自动 HTTPS
- ✅ Edge Function: 100GB-Hours/月
- ✅ Postgres: 256MB 存储 + 60 小时计算时间

### 升级需求
如果超过免费额度,考虑升级到 Pro 计划 ($20/月)。

---

## 安全建议

1. ✅ 定期轮换 `AUTH_SECRET`
2. ✅ 监控登录尝试日志
3. ✅ 定期审查白名单用户
4. ✅ 启用 Vercel 的 DDoS 保护
5. ✅ 配置 CSP (Content Security Policy)

---

需要帮助? 查看:
- [Vercel 文档](https://vercel.com/docs)
- [Next.js 部署文档](https://nextjs.org/docs/deployment)
- [Auth.js Vercel 部署指南](https://authjs.dev/guides/deployment)
