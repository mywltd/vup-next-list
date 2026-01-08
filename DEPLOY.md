# 🚀 服务器快速部署指南

使用云端 Docker 镜像在服务器上快速部署 VUP 音乐歌单系统。

## 📋 前提条件

- 服务器已安装 Docker（版本 >= 20.10）
- Docker Compose V2（集成在 Docker 中，使用 `docker compose` 命令）
- 开放端口 3001（或自定义端口）

**注意**：本文档使用 Docker Compose V2 命令 `docker compose`，如果你使用的是旧版独立的 `docker-compose`，请将所有 `docker compose` 替换为 `docker-compose`。

## 🚀 方式一：使用 docker-compose（推荐）

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

## 🔧 方式二：使用 Docker 命令

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

## 📝 方式三：使用一键部署脚本

### 步骤 1: 下载部署脚本

```bash
curl -fsSL https://raw.githubusercontent.com/mywltd/vup-next-list/main/deploy.sh -o deploy.sh
chmod +x deploy.sh
```

### 步骤 2: 运行脚本

```bash
./deploy.sh
```

脚本会自动：
- 检查 Docker 环境
- 创建必要的目录
- 拉取最新镜像
- 启动服务
- 显示访问地址

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

### 3. 无法访问

检查防火墙：

```bash
# Ubuntu/Debian
sudo ufw allow 3001

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=3001/tcp
sudo firewall-cmd --reload
```

### 4. 镜像拉取失败

手动拉取镜像：

```bash
docker pull mywltd/vup-music:latest
```

如果网络问题，可以配置镜像加速器。

### 5. 数据库权限问题

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

