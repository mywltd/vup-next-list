#!/bin/bash

# VUP 音乐歌单系统 - 一键安装脚本
# 使用方法: curl -fsSL https://raw.githubusercontent.com/你的仓库/main/install.sh | sudo bash

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
INSTALL_DIR="/opt/vupmusic"
GITHUB_REPO="mywltd/vup-next-list"
BRANCH="main"

echo -e "${BLUE}"
cat << "EOF"
╔════════════════════════════════════════╗
║   🎵 VUP 音乐歌单系统                 ║
║   一键安装脚本                         ║
╚════════════════════════════════════════╝
EOF
echo -e "${NC}"

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ 请使用 root 用户或 sudo 运行此脚本${NC}"
    exit 1
fi

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
        *)
            echo -e "${RED}❌ 不支持的系统架构: $ARCH${NC}"
            exit 1
            ;;
    esac
    
    # 检测系统类型
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
        OS_VERSION=$VERSION_ID
    else
        echo -e "${RED}❌ 无法检测系统类型${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ 系统架构: ${SYSTEM_ARCH}${NC}"
    echo -e "${GREEN}✓ 操作系统: ${OS} ${OS_VERSION}${NC}"
}

# 安装 Docker
install_docker() {
    if command -v docker &> /dev/null; then
        echo -e "${GREEN}✓ Docker 已安装${NC}"
        docker --version
        return
    fi
    
    echo -e "${BLUE}📦 安装 Docker...${NC}"
    
    case $OS in
        ubuntu|debian)
            # 安装依赖
            apt-get update
            apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release
            
            # 添加 Docker 官方 GPG 密钥
            mkdir -p /etc/apt/keyrings
            curl -fsSL https://download.docker.com/linux/${OS}/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
            
            # 添加 Docker 仓库
            echo \
              "deb [arch=${SYSTEM_ARCH} signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/${OS} \
              $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
            
            # 安装 Docker
            apt-get update
            apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
            ;;
        centos|rhel|rocky|almalinux|fedora)
            # 安装依赖
            yum install -y yum-utils
            
            # 添加 Docker 仓库
            yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
            
            # 安装 Docker
            yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
            
            # 启动 Docker
            systemctl start docker
            systemctl enable docker
            ;;
        *)
            echo -e "${RED}❌ 不支持的系统: ${OS}${NC}"
            exit 1
            ;;
    esac
    
    echo -e "${GREEN}✅ Docker 安装完成${NC}"
}

# 下载管理脚本
download_manager() {
    echo -e "${BLUE}📥 下载管理脚本...${NC}"
    
    # 创建安装目录
    mkdir -p "${INSTALL_DIR}"
    cd "${INSTALL_DIR}"
    
    # 备份旧脚本（如果存在）
    if [ -f "manage.sh" ]; then
        cp manage.sh manage.sh.bak
        echo -e "${YELLOW}📝 已备份旧脚本到 manage.sh.bak${NC}"
    fi
    
    # 下载 manage.sh
    curl -fsSL "https://raw.githubusercontent.com/${GITHUB_REPO}/${BRANCH}/manage.sh" -o manage.sh
    chmod +x manage.sh
    
    # 创建软链接到 /usr/local/bin
    ln -sf "${INSTALL_DIR}/manage.sh" /usr/local/bin/vupmusic
    
    echo -e "${GREEN}✅ 管理脚本下载完成${NC}"
}

# 主函数
main() {
    detect_system
    install_docker
    download_manager
    
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║   🎉 安装完成！                       ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${CYAN}使用方法：${NC}"
    echo -e "  运行管理工具: ${YELLOW}vupmusic${NC}"
    echo -e "  或直接运行:   ${YELLOW}${INSTALL_DIR}/manage.sh${NC}"
    echo ""
    echo -e "${CYAN}快速开始：${NC}"
    echo -e "  1. 运行 ${YELLOW}vupmusic${NC}"
    echo -e "  2. 选择 ${YELLOW}2. 添加新应用${NC}"
    echo -e "  3. 输入应用名称和域名"
    echo -e "  4. 等待部署完成"
    echo ""
    echo -e "${CYAN}⬆️  升级方法：${NC}"
    echo -e "  升级应用: ${YELLOW}vupmusic${NC} 后选择 ${YELLOW}11. 升级应用${NC}"
    echo -e "  升级脚本: ${YELLOW}vupmusic${NC} 后选择 ${YELLOW}12. 升级脚本${NC}"
    echo -e "  或重新运行: ${YELLOW}curl -fsSL https://raw.githubusercontent.com/${GITHUB_REPO}/${BRANCH}/install.sh | sudo bash${NC}"
    echo ""
    echo -e "${YELLOW}注意事项：${NC}"
    echo -e "  - 确保域名已解析到本服务器 IP"
    echo -e "  - 确保防火墙开放 80 和 443 端口"
    echo -e "  - SSL 证书将自动申请和续期"
    echo ""
}

# 运行主函数
main

