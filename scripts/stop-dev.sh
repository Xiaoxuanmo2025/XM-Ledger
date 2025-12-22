#!/bin/bash

# XM Ledger 开发环境停止脚本

echo "🛑 停止开发环境..."
echo ""

# 停止数据库
echo "📦 停止 PostgreSQL 数据库..."
docker-compose down

echo ""
echo "✅ 开发环境已停止"
echo ""
echo "💡 数据已保存在 Docker Volume 中"
echo "   下次启动时数据仍然存在"
echo ""
