#!/bin/bash

# VUP 音乐歌单系统 - 多应用管理脚本
# 支持多个应用实例、Caddy 反向代理、自动 SSL
# 使用方法: ./manage.sh

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 配置变量
INSTALL_DIR="/opt/vupmusic"
CONFIG_DIR="${INSTALL_DIR}/config"
APPS_DIR="${INSTALL_DIR}/apps"
CADDY_DIR="${INSTALL_DIR}/caddy"
DOCKER_IMAGE="mywltd/vup-music:latest"
NETWORK_NAME="vupmusic-network"

# 创建必要的目录
init_directories() {
    mkdir -p "${CONFIG_DIR}"
    mkdir -p "${APPS_DIR}"
    mkdir -p "${CADDY_DIR}/data"
    mkdir -p "${CADDY_DIR}/config"
}

# 显示标题
show_banner() {
    echo -e "${BLUE}"
    cat << "EOF"
╔════════════════════════════════════════╗
║   🎵 VUP 音乐歌单系统                 ║
║   多应用管理工具                       ║
╚════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

# 检查 Docker 是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker 未安装，请先安装 Docker${NC}"
        exit 1
    fi
    
    if ! command -v docker compose &> /dev/null; then
        echo -e "${RED}❌ Docker Compose 未安装，请先安装 Docker Compose${NC}"
        exit 1
    fi
}

# 创建 Docker 网络
create_network() {
    if ! docker network inspect "${NETWORK_NAME}" &> /dev/null; then
        echo -e "${BLUE}📡 创建 Docker 网络: ${NETWORK_NAME}${NC}"
        docker network create "${NETWORK_NAME}"
    fi
}

# 生成 Caddyfile
generate_caddyfile() {
    local caddyfile="${CADDY_DIR}/Caddyfile"
    
    echo "# VUP 音乐歌单系统 - Caddy 配置文件" > "${caddyfile}"
    echo "# 自动生成，请勿手动编辑" >> "${caddyfile}"
    echo "" >> "${caddyfile}"
    
    # 遍历所有应用
    for app_dir in "${APPS_DIR}"/*; do
        if [ -d "${app_dir}" ]; then
            local app_name=$(basename "${app_dir}")
            local domain_file="${app_dir}/domain.txt"
            
            if [ -f "${domain_file}" ]; then
                local domain=$(cat "${domain_file}")
                
                cat >> "${caddyfile}" << EOF

# ${app_name}
${domain} {
    reverse_proxy ${app_name}:3001
    encode gzip
    
    log {
        output file /var/log/caddy/${app_name}.log
        format json
    }
}

EOF
            fi
        fi
    done
}

# 启动或重启 Caddy
restart_caddy() {
    local caddy_compose="${CADDY_DIR}/docker-compose.yml"
    
    # 生成 Caddy docker-compose.yml
    cat > "${caddy_compose}" << 'EOF'
version: '3.8'

services:
  caddy:
    image: caddy:2-alpine
    container_name: vupmusic-caddy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - ./data:/data
      - ./config:/config
      - caddy-logs:/var/log/caddy
    networks:
      - vupmusic-network

volumes:
  caddy-logs:

networks:
  vupmusic-network:
    external: true
EOF

    cd "${CADDY_DIR}"
    
    if docker ps -a --format '{{.Names}}' | grep -q "^vupmusic-caddy$"; then
        echo -e "${BLUE}🔄 重启 Caddy...${NC}"
        docker compose restart
    else
        echo -e "${BLUE}🚀 启动 Caddy...${NC}"
        docker compose up -d
    fi
    
    echo -e "${GREEN}✅ Caddy 已启动${NC}"
}

# 列出所有应用
list_apps() {
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo -e "${CYAN}📋 应用列表${NC}"
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    
    if [ ! -d "${APPS_DIR}" ] || [ -z "$(ls -A ${APPS_DIR})" ]; then
        echo -e "${YELLOW}暂无应用${NC}"
        return
    fi
    
    local index=1
    for app_dir in "${APPS_DIR}"/*; do
        if [ -d "${app_dir}" ]; then
            local app_name=$(basename "${app_dir}")
            local domain_file="${app_dir}/domain.txt"
            local domain="未配置域名"
            
            if [ -f "${domain_file}" ]; then
                domain=$(cat "${domain_file}")
            fi
            
            # 检查容器状态
            local status="○ 未运行"
            if docker ps --format '{{.Names}}' | grep -q "^${app_name}$"; then
                status="${GREEN}● 运行中${NC}"
            elif docker ps -a --format '{{.Names}}' | grep -q "^${app_name}$"; then
                status="${RED}● 已停止${NC}"
            fi
            
            echo -e "${index}. ${BLUE}${app_name}${NC}"
            echo -e "   域名: ${domain}"
            echo -e "   状态: ${status}"
            echo ""
            
            ((index++))
        fi
    done
}

# 添加新应用
add_app() {
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo -e "${CYAN}➕ 添加新应用${NC}"
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    
    # 输入应用名称
    while true; do
        read -p "请输入应用名称（英文，如 music1）: " app_name
        
        if [ -z "${app_name}" ]; then
            echo -e "${RED}应用名称不能为空${NC}"
            continue
        fi
        
        if [[ ! "${app_name}" =~ ^[a-zA-Z0-9_-]+$ ]]; then
            echo -e "${RED}应用名称只能包含字母、数字、下划线和连字符${NC}"
            continue
        fi
        
        if [ -d "${APPS_DIR}/${app_name}" ]; then
            echo -e "${RED}应用 ${app_name} 已存在${NC}"
            continue
        fi
        
        break
    done
    
    # 输入域名
    while true; do
        read -p "请输入域名（如 music.example.com）: " domain
        
        if [ -z "${domain}" ]; then
            echo -e "${RED}域名不能为空${NC}"
            continue
        fi
        
        if [[ ! "${domain}" =~ ^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
            echo -e "${RED}域名格式不正确${NC}"
            continue
        fi
        
        break
    done
    
    # 创建应用目录
    local app_dir="${APPS_DIR}/${app_name}"
    mkdir -p "${app_dir}/data/uploads"
    
    # 保存域名
    echo "${domain}" > "${app_dir}/domain.txt"
    
    # 生成 docker-compose.yml
    cat > "${app_dir}/docker-compose.yml" << EOF
version: '3.8'

services:
  ${app_name}:
    image: ${DOCKER_IMAGE}
    container_name: ${app_name}
    restart: unless-stopped
    volumes:
      - ./data:/data
    environment:
      - NODE_ENV=production
      - PORT=3001
      - DATA_DIR=/data
      - SESSION_SECRET=$(openssl rand -base64 32)
    networks:
      - vupmusic-network

networks:
  vupmusic-network:
    external: true
EOF
    
    # 启动应用
    cd "${app_dir}"
    echo -e "${BLUE}🚀 启动应用 ${app_name}...${NC}"
    docker compose up -d
    
    # 更新 Caddyfile 并重启 Caddy
    generate_caddyfile
    restart_caddy
    
    echo -e "${GREEN}✅ 应用 ${app_name} 创建成功${NC}"
    echo -e "${GREEN}   访问地址: https://${domain}${NC}"
    echo -e "${YELLOW}   请确保域名 ${domain} 已解析到本服务器 IP${NC}"
}

# 删除应用
delete_app() {
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo -e "${CYAN}🗑️  删除应用${NC}"
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    
    list_apps
    
    read -p "请输入要删除的应用名称: " app_name
    
    if [ -z "${app_name}" ]; then
        echo -e "${RED}应用名称不能为空${NC}"
        return
    fi
    
    local app_dir="${APPS_DIR}/${app_name}"
    
    if [ ! -d "${app_dir}" ]; then
        echo -e "${RED}应用 ${app_name} 不存在${NC}"
        return
    fi
    
    # 确认删除
    echo -e "${YELLOW}警告: 删除应用将删除所有数据，此操作不可恢复！${NC}"
    read -p "确认删除应用 ${app_name}? (yes/no): " confirm
    
    if [ "${confirm}" != "yes" ]; then
        echo -e "${YELLOW}已取消${NC}"
        return
    fi
    
    # 停止并删除容器
    cd "${app_dir}"
    echo -e "${BLUE}🛑 停止应用 ${app_name}...${NC}"
    docker compose down -v
    
    # 删除应用目录
    cd "${INSTALL_DIR}"
    rm -rf "${app_dir}"
    
    # 更新 Caddyfile 并重启 Caddy
    generate_caddyfile
    restart_caddy
    
    echo -e "${GREEN}✅ 应用 ${app_name} 已删除${NC}"
}

# 重命名应用
rename_app() {
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo -e "${CYAN}✏️  重命名应用${NC}"
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    
    list_apps
    
    read -p "请输入要重命名的应用名称: " old_name
    
    if [ -z "${old_name}" ]; then
        echo -e "${RED}应用名称不能为空${NC}"
        return
    fi
    
    local old_dir="${APPS_DIR}/${old_name}"
    
    if [ ! -d "${old_dir}" ]; then
        echo -e "${RED}应用 ${old_name} 不存在${NC}"
        return
    fi
    
    read -p "请输入新的应用名称: " new_name
    
    if [ -z "${new_name}" ]; then
        echo -e "${RED}新应用名称不能为空${NC}"
        return
    fi
    
    if [[ ! "${new_name}" =~ ^[a-zA-Z0-9_-]+$ ]]; then
        echo -e "${RED}应用名称只能包含字母、数字、下划线和连字符${NC}"
        return
    fi
    
    local new_dir="${APPS_DIR}/${new_name}"
    
    if [ -d "${new_dir}" ]; then
        echo -e "${RED}应用 ${new_name} 已存在${NC}"
        return
    fi
    
    # 停止旧容器
    cd "${old_dir}"
    echo -e "${BLUE}🛑 停止应用 ${old_name}...${NC}"
    docker compose down
    
    # 重命名目录
    mv "${old_dir}" "${new_dir}"
    
    # 更新 docker-compose.yml
    sed -i "s/${old_name}:/${new_name}:/g" "${new_dir}/docker-compose.yml"
    sed -i "s/container_name: ${old_name}/container_name: ${new_name}/g" "${new_dir}/docker-compose.yml"
    
    # 启动新容器
    cd "${new_dir}"
    echo -e "${BLUE}🚀 启动应用 ${new_name}...${NC}"
    docker compose up -d
    
    # 更新 Caddyfile 并重启 Caddy
    generate_caddyfile
    restart_caddy
    
    echo -e "${GREEN}✅ 应用已重命名: ${old_name} → ${new_name}${NC}"
}

# 修改域名
change_domain() {
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo -e "${CYAN}🌐 修改域名${NC}"
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    
    list_apps
    
    read -p "请输入要修改域名的应用名称: " app_name
    
    if [ -z "${app_name}" ]; then
        echo -e "${RED}应用名称不能为空${NC}"
        return
    fi
    
    local app_dir="${APPS_DIR}/${app_name}"
    
    if [ ! -d "${app_dir}" ]; then
        echo -e "${RED}应用 ${app_name} 不存在${NC}"
        return
    fi
    
    local domain_file="${app_dir}/domain.txt"
    local old_domain=""
    
    if [ -f "${domain_file}" ]; then
        old_domain=$(cat "${domain_file}")
        echo -e "${YELLOW}当前域名: ${old_domain}${NC}"
    fi
    
    read -p "请输入新域名（如 music.example.com）: " new_domain
    
    if [ -z "${new_domain}" ]; then
        echo -e "${RED}域名不能为空${NC}"
        return
    fi
    
    if [[ ! "${new_domain}" =~ ^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
        echo -e "${RED}域名格式不正确${NC}"
        return
    fi
    
    # 更新域名
    echo "${new_domain}" > "${domain_file}"
    
    # 更新 Caddyfile 并重启 Caddy
    generate_caddyfile
    restart_caddy
    
    echo -e "${GREEN}✅ 域名已更新${NC}"
    echo -e "${GREEN}   新域名: https://${new_domain}${NC}"
    echo -e "${YELLOW}   请确保域名 ${new_domain} 已解析到本服务器 IP${NC}"
}

# 启动应用
start_app() {
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo -e "${CYAN}▶️  启动应用${NC}"
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    
    list_apps
    
    read -p "请输入要启动的应用名称（留空启动全部）: " app_name
    
    if [ -z "${app_name}" ]; then
        # 启动所有应用
        for app_dir in "${APPS_DIR}"/*; do
            if [ -d "${app_dir}" ]; then
                local name=$(basename "${app_dir}")
                cd "${app_dir}"
                echo -e "${BLUE}🚀 启动 ${name}...${NC}"
                docker compose up -d
            fi
        done
        echo -e "${GREEN}✅ 所有应用已启动${NC}"
    else
        local app_dir="${APPS_DIR}/${app_name}"
        
        if [ ! -d "${app_dir}" ]; then
            echo -e "${RED}应用 ${app_name} 不存在${NC}"
            return
        fi
        
        cd "${app_dir}"
        echo -e "${BLUE}🚀 启动 ${app_name}...${NC}"
        docker compose up -d
        echo -e "${GREEN}✅ 应用 ${app_name} 已启动${NC}"
    fi
}

# 停止应用
stop_app() {
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo -e "${CYAN}⏸️  停止应用${NC}"
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    
    list_apps
    
    read -p "请输入要停止的应用名称（留空停止全部）: " app_name
    
    if [ -z "${app_name}" ]; then
        # 停止所有应用
        for app_dir in "${APPS_DIR}"/*; do
            if [ -d "${app_dir}" ]; then
                local name=$(basename "${app_dir}")
                cd "${app_dir}"
                echo -e "${BLUE}🛑 停止 ${name}...${NC}"
                docker compose stop
            fi
        done
        echo -e "${GREEN}✅ 所有应用已停止${NC}"
    else
        local app_dir="${APPS_DIR}/${app_name}"
        
        if [ ! -d "${app_dir}" ]; then
            echo -e "${RED}应用 ${app_name} 不存在${NC}"
            return
        fi
        
        cd "${app_dir}"
        echo -e "${BLUE}🛑 停止 ${app_name}...${NC}"
        docker compose stop
        echo -e "${GREEN}✅ 应用 ${app_name} 已停止${NC}"
    fi
}

# 查看应用日志
view_logs() {
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo -e "${CYAN}📄 查看日志${NC}"
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    
    list_apps
    
    read -p "请输入要查看日志的应用名称: " app_name
    
    if [ -z "${app_name}" ]; then
        echo -e "${RED}应用名称不能为空${NC}"
        return
    fi
    
    local app_dir="${APPS_DIR}/${app_name}"
    
    if [ ! -d "${app_dir}" ]; then
        echo -e "${RED}应用 ${app_name} 不存在${NC}"
        return
    fi
    
    cd "${app_dir}"
    echo -e "${BLUE}📄 查看 ${app_name} 日志 (按 Ctrl+C 退出)${NC}"
    docker compose logs -f --tail=100
}

# 备份应用数据
backup_app() {
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo -e "${CYAN}💾 备份应用数据${NC}"
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    
    list_apps
    
    read -p "请输入要备份的应用名称: " app_name
    
    if [ -z "${app_name}" ]; then
        echo -e "${RED}应用名称不能为空${NC}"
        return
    fi
    
    local app_dir="${APPS_DIR}/${app_name}"
    
    if [ ! -d "${app_dir}" ]; then
        echo -e "${RED}应用 ${app_name} 不存在${NC}"
        return
    fi
    
    local backup_dir="${INSTALL_DIR}/backups"
    mkdir -p "${backup_dir}"
    
    local backup_file="${backup_dir}/${app_name}_$(date +%Y%m%d_%H%M%S).tar.gz"
    
    echo -e "${BLUE}💾 备份中...${NC}"
    tar -czf "${backup_file}" -C "${APPS_DIR}" "${app_name}"
    
    echo -e "${GREEN}✅ 备份完成${NC}"
    echo -e "${GREEN}   备份文件: ${backup_file}${NC}"
}

# 显示主菜单
show_menu() {
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo -e "${CYAN}主菜单${NC}"
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo "1. 列出所有应用"
    echo "2. 添加新应用"
    echo "3. 删除应用"
    echo "4. 重命名应用"
    echo "5. 修改域名"
    echo "6. 启动应用"
    echo "7. 停止应用"
    echo "8. 查看日志"
    echo "9. 备份应用"
    echo "10. 重启 Caddy"
    echo "0. 退出"
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
}

# 主函数
main() {
    show_banner
    
    # 检查 Docker
    check_docker
    
    # 初始化目录
    init_directories
    
    # 创建 Docker 网络
    create_network
    
    # 生成 Caddyfile（如果不存在）
    if [ ! -f "${CADDY_DIR}/Caddyfile" ]; then
        generate_caddyfile
    fi
    
    # 启动 Caddy（如果还未启动）
    if ! docker ps --format '{{.Names}}' | grep -q "^vupmusic-caddy$"; then
        restart_caddy
    fi
    
    # 交互式菜单
    while true; do
        show_menu
        read -p "请选择操作 (0-10): " choice
        
        case $choice in
            1) list_apps ;;
            2) add_app ;;
            3) delete_app ;;
            4) rename_app ;;
            5) change_domain ;;
            6) start_app ;;
            7) stop_app ;;
            8) view_logs ;;
            9) backup_app ;;
            10) generate_caddyfile && restart_caddy ;;
            0) 
                echo -e "${GREEN}👋 再见！${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}无效的选择，请重试${NC}"
                ;;
        esac
        
        echo ""
        read -p "按回车键继续..."
    done
}

# 运行主函数
main

