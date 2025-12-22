#!/bin/bash

# XM Ledger 开发环境启动脚本

echo "🚀 启动 XM Ledger 开发环境..."
echo ""

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker 未运行,请先启动 Docker Desktop"
    exit 1
fi

# 启动数据库
echo "📦 启动 PostgreSQL 数据库..."
docker-compose up -d

# 等待数据库就绪
echo "⏳ 等待数据库启动..."
sleep 3

# 检查数据库是否就绪
until docker-compose exec -T postgres pg_isready -U xmledger > /dev/null 2>&1; do
    echo "   等待数据库..."
    sleep 2
done

echo "✅ 数据库已就绪"
echo ""

# 生成 Prisma Client (如果需要)
if [ ! -d "node_modules/.prisma" ]; then
    echo "🔧 生成 Prisma Client..."
    pnpm db:generate
fi

# 推送数据库 Schema
echo "🗄️  初始化数据库表..."
pnpm db:push

echo ""
echo "✨ 开发环境已就绪!"
echo ""
echo "📊 访问 Prisma Studio: pnpm db:studio"
echo "🌐 启动开发服务器: pnpm dev"
echo ""
