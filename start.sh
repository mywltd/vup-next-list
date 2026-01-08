#!/bin/bash

# VUP 音乐歌单系统启动脚本

echo "🎵 VUP 音乐歌单系统"
echo "===================="
echo ""

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ 错误: 未检测到 Docker，请先安装 Docker"
    exit 1
fi

# 检查 Docker Compose 是否安装（优先 V2）
if docker compose version &> /dev/null 2>&1; then
    COMPOSE_CMD="docker compose"
elif command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
    echo "⚠️  检测到 Docker Compose V1，建议升级到 V2"
else
    echo "❌ 错误: 未检测到 Docker Compose，请先安装"
    exit 1
fi

echo "✅ Docker 环境检查通过"
echo ""

# 创建数据目录
if [ ! -d "./data" ]; then
    echo "📁 创建数据目录..."
    mkdir -p ./data/uploads
    echo "✅ 数据目录创建完成"
fi

echo ""
echo "🚀 启动服务..."
$COMPOSE_CMD up -d

echo ""
echo "⏳ 等待服务启动..."
sleep 3

# 检查服务状态
if $COMPOSE_CMD ps | grep -q "Up"; then
    echo ""
    echo "✅ 服务启动成功！"
    echo ""
    echo "📝 访问信息:"
    echo "   主页: http://localhost:3001"
    echo "   管理后台: http://localhost:3001/admin/login"
    echo ""
    echo "💡 提示:"
    echo "   - 首次访问会进入安装向导"
    echo "   - 查看日志: $COMPOSE_CMD logs -f"
    echo "   - 停止服务: $COMPOSE_CMD down"
    echo ""
else
    echo ""
    echo "❌ 服务启动失败，请检查日志:"
    echo "   $COMPOSE_CMD logs"
    exit 1
fi

