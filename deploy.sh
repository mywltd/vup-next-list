#!/bin/bash

# VUP 音乐歌单系统 - 服务器一键部署脚本
# 适用于 Linux 服务器
# 使用方法: curl -fsSL https://raw.githubusercontent.com/mywltd/vup-next-list/main/deploy.sh | bash

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
INSTALL_DIR="/opt/vupmusic"
DOCKER_IMAGE="mywltd/vup-music:latest"
CONTAINER_NAME="vup-music"
PORT="3001"

echo -e "${BLUE}"
cat << "EOF"
╔════════════════════════════════════════╗
║   🎵 VUP 音乐歌单系统                 ║
║   服务器一键部署脚本                   ║
╚════════════════════════════════════════╝
EOF
echo -e "${NC}"

# 检测系统信息
detect_system() {
    echo -e "${BLUE}🔍 检测系统信息...${NC}"
    
    # 检测系统架构
    ARCH=$(uname -m)
    case $ARCH in
        x86_64|amd64)
            SYSTEM_ARCH="amd64"
            ;;
        aarch64|arm64)
            SYSTEM_ARCH="arm64"
            ;;
        armv7l)
            SYSTEM_ARCH="armhf"
            ;;
        *)
            echo -e "${RED}❌ 不支持的系统架构: $ARCH${NC}"
            exit 1
            ;;
    esac
    
    # 检测操作系统
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
        OS_VERSION=$VERSION_ID
        OS_NAME=$NAME
    elif [ -f /etc/redhat-release ]; then
        OS="rhel"
        OS_NAME="Red Hat Enterprise Linux"
    else
        echo -e "${RED}❌ 无法检测操作系统${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ 系统信息:${NC}"
    echo -e "   操作系统: ${OS_NAME}"
    echo -e "   系统架构: ${SYSTEM_ARCH}"
    echo -e "   内核版本: $(uname -r)"
    echo ""
}

# 检查是否为 root 用户
check_root() {
    if [ "$EUID" -ne 0 ]; then 
        echo -e "${YELLOW}⚠️  建议使用 sudo 运行此脚本${NC}"
        echo -e "${YELLOW}   或使用 root 用户（安装 Docker 需要 root 权限）${NC}"
        read -p "是否继续? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# 安装 Docker
install_docker() {
    echo -e "${BLUE}🐳 开始安装 Docker...${NC}"
    
    case $OS in
        ubuntu|debian)
            echo -e "${YELLOW}检测到 Ubuntu/Debian 系统${NC}"
            
            # 更新软件包索引
            apt-get update
            
            # 安装必要的依赖
            apt-get install -y \
                ca-certificates \
                curl \
                gnupg \
                lsb-release
            
            # 添加 Docker 官方 GPG 密钥
            install -m 0755 -d /etc/apt/keyrings
            curl -fsSL https://download.docker.com/linux/$OS/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
            chmod a+r /etc/apt/keyrings/docker.gpg
            
            # 设置 Docker 仓库
            echo \
                "deb [arch=$SYSTEM_ARCH signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/$OS \
                $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
            
            # 安装 Docker Engine
            apt-get update
            apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
            ;;
            
        centos|rhel|rocky|almalinux)
            echo -e "${YELLOW}检测到 CentOS/RHEL 系统${NC}"
            
            # 安装必要的依赖
            yum install -y yum-utils
            
            # 添加 Docker 仓库
            yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
            
            # 安装 Docker Engine
            yum install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
            
            # 启动 Docker
            systemctl start docker
            systemctl enable docker
            ;;
            
        fedora)
            echo -e "${YELLOW}检测到 Fedora 系统${NC}"
            
            # 安装必要的依赖
            dnf -y install dnf-plugins-core
            
            # 添加 Docker 仓库
            dnf config-manager --add-repo https://download.docker.com/linux/fedora/docker-ce.repo
            
            # 安装 Docker Engine
            dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
            
            # 启动 Docker
            systemctl start docker
            systemctl enable docker
            ;;
            
        *)
            echo -e "${RED}❌ 不支持的操作系统: $OS${NC}"
            echo -e "${YELLOW}请手动安装 Docker: https://docs.docker.com/engine/install/${NC}"
            exit 1
            ;;
    esac
    
    # 验证 Docker 安装
    if command -v docker &> /dev/null; then
        echo -e "${GREEN}✅ Docker 安装成功${NC}"
        docker --version
        echo ""
    else
        echo -e "${RED}❌ Docker 安装失败${NC}"
        exit 1
    fi
}

# 检查 Docker 是否安装
check_docker() {
    echo -e "${BLUE}📦 检查 Docker 环境...${NC}"
    
    if ! command -v docker &> /dev/null; then
        echo -e "${YELLOW}⚠️  Docker 未安装${NC}"
        echo ""
        read -p "是否自动安装 Docker? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            install_docker
        else
            echo -e "${RED}❌ 需要安装 Docker 才能继续${NC}"
            echo -e "${YELLOW}手动安装: https://docs.docker.com/engine/install/${NC}"
            exit 1
        fi
    else
        echo -e "${GREEN}✅ Docker 已安装${NC}"
        docker --version
    fi
    
    # 优先检查 Docker Compose V2（docker compose）
    if docker compose version &> /dev/null; then
        COMPOSE_CMD="docker compose"
        echo -e "${GREEN}✅ 检测到 Docker Compose V2${NC}"
    elif command -v docker-compose &> /dev/null; then
        COMPOSE_CMD="docker-compose"
        echo -e "${YELLOW}⚠️  检测到 Docker Compose V1，建议升级到 V2${NC}"
    else
        echo -e "${RED}❌ Docker Compose 未安装${NC}"
        echo -e "${YELLOW}请先安装 Docker Compose V2${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Docker 环境检查通过${NC}"
    docker --version
    $COMPOSE_CMD version
    echo ""
}

# 创建安装目录
create_directory() {
    echo -e "${BLUE}📁 创建安装目录...${NC}"
    
    if [ -d "$INSTALL_DIR" ]; then
        echo -e "${YELLOW}⚠️  目录 $INSTALL_DIR 已存在${NC}"
        read -p "是否继续? 这将覆盖现有配置 (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        mkdir -p "$INSTALL_DIR"
    fi
    
    cd "$INSTALL_DIR"
    mkdir -p data/uploads
    
    echo -e "${GREEN}✅ 目录创建完成: $INSTALL_DIR${NC}"
    echo ""
}

# 生成随机密钥
generate_secret() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
}

# 创建 docker-compose.yml
create_compose_file() {
    echo -e "${BLUE}📝 创建 docker-compose.yml...${NC}"
    
    # 生成随机 JWT_SECRET
    JWT_SECRET=$(generate_secret)
    
    cat > docker-compose.yml << EOF
version: '3.8'

services:
  vup-music:
    image: ${DOCKER_IMAGE}
    container_name: ${CONTAINER_NAME}
    restart: unless-stopped
    ports:
      - "${PORT}:3001"
    volumes:
      - ./data:/data
    environment:
      - NODE_ENV=production
      - PORT=3001
      - DATA_DIR=/data
      - JWT_SECRET=${JWT_SECRET}
      - JWT_EXPIRES_IN=7d
      - CORS_ORIGIN=http://localhost:3000
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3001/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - vup-music-network

networks:
  vup-music-network:
    driver: bridge

volumes:
  data:
    driver: local
EOF
    
    echo -e "${GREEN}✅ docker-compose.yml 创建完成${NC}"
    echo -e "${YELLOW}📝 JWT_SECRET 已自动生成${NC}"
    echo ""
}

# 拉取 Docker 镜像
pull_image() {
    echo -e "${BLUE}📥 拉取 Docker 镜像...${NC}"
    echo -e "${YELLOW}镜像: ${DOCKER_IMAGE}${NC}"
    echo ""
    
    docker pull ${DOCKER_IMAGE}
    
    echo -e "${GREEN}✅ 镜像拉取完成${NC}"
    echo ""
}

# 停止旧容器（如果存在）
stop_old_container() {
    if docker ps -a | grep -q ${CONTAINER_NAME}; then
        echo -e "${YELLOW}⚠️  发现已存在的容器，正在停止...${NC}"
        docker stop ${CONTAINER_NAME} 2>/dev/null || true
        docker rm ${CONTAINER_NAME} 2>/dev/null || true
        echo -e "${GREEN}✅ 旧容器已清理${NC}"
        echo ""
    fi
}

# 启动服务
start_service() {
    echo -e "${BLUE}🚀 启动服务...${NC}"
    
    $COMPOSE_CMD up -d
    
    echo -e "${GREEN}✅ 服务启动成功${NC}"
    echo ""
}

# 等待服务就绪
wait_for_service() {
    echo -e "${BLUE}⏳ 等待服务就绪...${NC}"
    
    for i in {1..30}; do
        if curl -s http://localhost:${PORT}/api/health > /dev/null 2>&1; then
            echo -e "${GREEN}✅ 服务已就绪${NC}"
            return 0
        fi
        echo -n "."
        sleep 2
    done
    
    echo ""
    echo -e "${YELLOW}⚠️  服务可能需要更多时间启动，请稍后检查${NC}"
}

# 显示访问信息
show_info() {
    # 获取服务器 IP
    SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || echo "YOUR_SERVER_IP")
    
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║   ✅ 部署完成！                       ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}📝 访问信息:${NC}"
    echo -e "   主页: ${GREEN}http://${SERVER_IP}:${PORT}${NC}"
    echo -e "   管理后台: ${GREEN}http://${SERVER_IP}:${PORT}/admin/login${NC}"
    echo ""
    echo -e "${BLUE}💡 使用提示:${NC}"
    echo -e "   1. 首次访问会进入安装向导"
    echo -e "   2. 按照提示完成初始化配置"
    echo -e "   3. 配置完成后即可使用"
    echo ""
    echo -e "${BLUE}🔧 常用命令:${NC}"
    echo -e "   查看日志: ${YELLOW}cd ${INSTALL_DIR} && ${COMPOSE_CMD} logs -f${NC}"
    echo -e "   停止服务: ${YELLOW}cd ${INSTALL_DIR} && ${COMPOSE_CMD} down${NC}"
    echo -e "   重启服务: ${YELLOW}cd ${INSTALL_DIR} && ${COMPOSE_CMD} restart${NC}"
    echo -e "   更新镜像: ${YELLOW}cd ${INSTALL_DIR} && ${COMPOSE_CMD} pull && ${COMPOSE_CMD} up -d${NC}"
    echo ""
    echo -e "${BLUE}📁 数据目录:${NC}"
    echo -e "   ${INSTALL_DIR}/data"
    echo ""
    echo -e "${BLUE}📖 更多文档:${NC}"
    echo -e "   https://github.com/mywltd/vup-next-list"
    echo ""
}

# 主函数
main() {
    detect_system
    check_root
    check_docker
    create_directory
    create_compose_file
    pull_image
    stop_old_container
    start_service
    wait_for_service
    show_info
}

# 执行主函数
main

