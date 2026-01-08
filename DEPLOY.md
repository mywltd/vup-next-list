# 🚀 服务器快速部署指南

使用云端 Docker 镜像在服务器上快速部署 VUP 音乐歌单系统。

## 📋 前提条件

- Linux 服务器（支持 Ubuntu, Debian, CentOS, RHEL, Fedora, Rocky Linux, AlmaLinux）
- 系统架构：x86_64 (amd64) 或 ARM64
- 开放端口 3001（或自定义端口）
- 具有 sudo 或 root 权限

**Docker 要求**：
- 如果未安装 Docker，部署脚本会自动检测并安装
- 手动部署需要 Docker 版本 >= 20.10
- 自动安装会包含 Docker Compose V2

**注意**：本文档使用 Docker Compose V2 命令 `docker compose`，如果你使用的是旧版独立的 `docker-compose`，请将所有 `docker compose` 替换为 `docker-compose`。

## 🚀 方式一：一键部署脚本（最简单，推荐）

### 自动安装 Docker 并部署

```bash
curl -fsSL https://raw.githubusercontent.com/mywltd/vup-next-list/main/deploy.sh | sudo bash
```

**脚本功能**：
- ✅ 自动检测系统信息（架构、发行版）
- ✅ 自动安装 Docker（如果未安装）
- ✅ 自动安装 Docker Compose V2
- ✅ 创建部署目录
- ✅ 生成安全配置
- ✅ 拉取最新镜像
- ✅ 启动服务

**支持的系统**：
- Ubuntu 18.04+
- Debian 10+
- CentOS 7/8
- RHEL 7/8
- Rocky Linux 8/9
- AlmaLinux 8/9
- Fedora 35+

**支持的架构**：
- x86_64 (amd64)
- aarch64 (arm64)
- armv7l (armhf)

### 分步说明

如果你想了解脚本执行的具体步骤：

1. **系统检测**
   - 检测操作系统类型和版本
   - 检测系统架构
   - 检查内核版本

2. **Docker 安装（可选）**
   - 如果未安装 Docker，询问是否自动安装
   - 根据系统类型选择合适的安装方法
   - 安装 Docker Engine + Docker Compose V2
   - 启动并启用 Docker 服务

3. **服务部署**
   - 创建 `/opt/vupmusic` 目录
   - 生成 `docker-compose.yml` 配置
   - 拉取 Docker 镜像
   - 启动服务

## 🔧 方式二：使用 docker compose 手动部署

### 步骤 1: 创建部署目录

```bash
mkdir -p /opt/vupmusic
cd /opt/vupmusic
```

### 步骤 2: 创建 docker-compose.yml

```bash
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  vup-music:
    image: mywltd/vup-music:latest
    container_name: vup-music
    restart: unless-stopped
    ports:
      - "3001:3001"
    volumes:
      - ./data:/data
    environment:
      - NODE_ENV=production
      - PORT=3001
      - DATA_DIR=/data
      - SESSION_SECRET=VUP-hR7kY9X4QmP2EJv6A8LZCwNfS3T0K5U1rDBeMVaYqG
      - CORS_ORIGIN=http://localhost:3000
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3001/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

networks:
  default:
    name: vup-music-network
EOF
```

**重要**: 请修改 `SESSION_SECRET` 为你自己的随机密钥！

### 步骤 3: 启动服务

```bash
docker compose up -d
```

### 步骤 4: 查看日志

```bash
docker compose logs -f
```

### 步骤 5: 访问系统

浏览器访问：`http://your-server-ip:3001`

首次访问会进入安装向导。

## 🐳 方式三：使用 Docker 命令

### 一键启动

```bash
docker run -d \
  --name vup-music \
  --restart unless-stopped \
  -p 3001:3001 \
  -v /opt/vupmusic/data:/data \
  -e NODE_ENV=production \
  -e PORT=3001 \
  -e DATA_DIR=/data \
  -e SESSION_SECRET=请修改为你的随机密钥-至少32位 \
  -e CORS_ORIGIN=http://localhost:3000 \
  mywltd/vup-music:latest
```

## 💻 手动安装 Docker（可选）

如果自动安装失败，可以手动安装：

### Ubuntu/Debian

```bash
# 更新软件包
sudo apt-get update

# 安装依赖
sudo apt-get install -y ca-certificates curl gnupg

# 添加 Docker GPG 密钥
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# 设置仓库
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 安装 Docker
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 启动 Docker
sudo systemctl start docker
sudo systemctl enable docker
```

### CentOS/RHEL

```bash
# 安装依赖
sudo yum install -y yum-utils

# 添加 Docker 仓库
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# 安装 Docker
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 启动 Docker
sudo systemctl start docker
sudo systemctl enable docker
```

### 验证安装

```bash
docker --version
docker compose version
```

## 🌐 配置 Nginx 反向代理（可选）

### 安装 Nginx

```bash
# Ubuntu/Debian
sudo apt update && sudo apt install nginx -y

# CentOS/RHEL
sudo yum install nginx -y
```

### 配置反向代理

```bash
sudo nano /etc/nginx/sites-available/vupmusic
```

添加以下配置：

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 修改为你的域名

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/vupmusic /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 配置 HTTPS（使用 Let's Encrypt）

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取证书并自动配置
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

## 🔄 服务管理命令

### 使用 docker compose

```bash
# 启动服务
docker compose up -d

# 停止服务
docker compose down

# 重启服务
docker compose restart

# 查看日志
docker compose logs -f

# 查看状态
docker compose ps

# 更新镜像
docker compose pull
docker compose up -d
```

### 使用 Docker 命令

```bash
# 启动容器
docker start vup-music

# 停止容器
docker stop vup-music

# 重启容器
docker restart vup-music

# 查看日志
docker logs -f vup-music

# 进入容器
docker exec -it vup-music sh

# 删除容器
docker rm -f vup-music

# 更新镜像
docker pull mywltd/vup-music:latest
docker stop vup-music
docker rm vup-music
# 然后重新运行启动命令
```

## 📦 数据备份

### 备份数据库和上传文件

```bash
# 创建备份
tar -czf vupmusic-backup-$(date +%Y%m%d).tar.gz /opt/vupmusic/data

# 恢复备份
tar -xzf vupmusic-backup-20260109.tar.gz -C /
```

### 自动备份脚本

```bash
cat > /opt/vupmusic/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/vupmusic/backups"
mkdir -p $BACKUP_DIR

# 备份数据
tar -czf $BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).tar.gz /opt/vupmusic/data

# 保留最近 7 天的备份
find $BACKUP_DIR -name "backup-*.tar.gz" -mtime +7 -delete

echo "备份完成: $(date)"
EOF

chmod +x /opt/vupmusic/backup.sh
```

设置定时备份（每天凌晨 3 点）：

```bash
crontab -e
```

添加：

```
0 3 * * * /opt/vupmusic/backup.sh >> /opt/vupmusic/backup.log 2>&1
```

## 🔧 自定义配置

### 修改端口

编辑 `docker-compose.yml`：

```yaml
ports:
  - "8080:3001"  # 将 3001 改为你想要的端口
```

然后重启：

```bash
docker compose down
docker compose up -d
```

### 修改环境变量

编辑 `docker-compose.yml` 的 `environment` 部分，然后重启服务。

### 查看系统状态

访问健康检查接口：

```bash
curl http://localhost:3001/api/health
```

## 🔍 故障排除

### 1. 端口被占用

检查端口占用：

```bash
sudo netstat -tulpn | grep 3001
```

修改为其他端口或停止占用端口的程序。

### 2. 容器启动失败

查看详细日志：

```bash
docker logs vup-music
```

### 3. Docker 安装失败

**症状**：自动安装 Docker 失败

**解决方案**：
1. 检查系统是否支持（见前提条件）
2. 检查网络连接
3. 尝试手动安装（见上方手动安装章节）
4. 查看详细错误日志

### 4. 无法访问

检查防火墙：

```bash
# Ubuntu/Debian
sudo ufw allow 3001

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=3001/tcp
sudo firewall-cmd --reload
```

### 5. 镜像拉取失败

手动拉取镜像：

```bash
docker pull mywltd/vup-music:latest
```

如果网络问题，可以配置镜像加速器：

```bash
# 创建 Docker 配置目录
sudo mkdir -p /etc/docker

# 配置镜像加速器（以阿里云为例）
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["https://your-mirror-address.mirror.aliyuncs.com"]
}
EOF

# 重启 Docker
sudo systemctl daemon-reload
sudo systemctl restart docker
```

### 6. 系统架构不支持

**症状**：提示不支持的系统架构

**支持的架构**：
- x86_64 (amd64)
- aarch64 (arm64)
- armv7l (armhf，部分镜像可能不支持）

**解决方案**：
- 确认系统架构：`uname -m`
- 使用支持的架构的服务器

### 7. 数据库权限问题

```bash
sudo chown -R 1000:1000 /opt/vupmusic/data
sudo chmod -R 755 /opt/vupmusic/data
```

## 📊 性能优化

### 配置资源限制

编辑 `docker-compose.yml`：

```yaml
services:
  vup-music:
    # ... 其他配置 ...
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### 启用日志轮转

编辑 `docker-compose.yml`：

```yaml
services:
  vup-music:
    # ... 其他配置 ...
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## 🔐 安全建议

1. **修改默认密钥**
   - 必须修改 `SESSION_SECRET`
   - 使用强密码作为管理员密码

2. **配置防火墙**
   - 仅开放必要端口
   - 使用 Nginx 反向代理

3. **启用 HTTPS**
   - 使用 Let's Encrypt 证书
   - 强制 HTTPS 访问

4. **定期更新**
   - 定期拉取最新镜像
   - 关注安全公告

5. **限制访问**
   - 配置 IP 白名单（如果需要）
   - 使用强密码策略

## 📞 获取帮助

- **文档**: https://github.com/mywltd/vup-next-list
- **问题反馈**: https://github.com/mywltd/vup-next-list/issues
- **Docker Hub**: https://hub.docker.com/r/mywltd/vup-music

## 🎯 快速命令参考

| 操作 | 命令 |
|------|------|
| 启动服务 | `docker compose up -d` |
| 停止服务 | `docker compose down` |
| 查看日志 | `docker compose logs -f` |
| 更新镜像 | `docker compose pull && docker compose up -d` |
| 重启服务 | `docker compose restart` |
| 查看状态 | `docker compose ps` |
| 备份数据 | `tar -czf backup.tar.gz /opt/vupmusic/data` |

---

**最后更新**: 2026-01-09  
**镜像版本**: mywltd/vup-music:latest

