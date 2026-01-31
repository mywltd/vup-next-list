# VUP 音乐歌单系统 - 多应用部署指南

## 📖 简介

本指南介绍如何使用新的多应用管理系统，支持在一台服务器上部署多个独立的歌单应用，每个应用对应不同的域名，通过 Caddy 反向代理统一管理，自动申请和续期 SSL 证书。

## ✨ 核心特性

- 🚀 **一键安装**: 自动安装 Docker 和必要组件
- 🌐 **多应用管理**: 支持创建多个独立应用实例
- 🔒 **自动 SSL**: Caddy 自动申请和续期 Let's Encrypt 证书
- 🔧 **简单配置**: 交互式菜单，无需手动编辑配置文件
- 📦 **容器隔离**: 每个应用独立容器，互不影响
- 🌍 **域名绑定**: 每个应用绑定独立域名
- 🔌 **端口复用**: 应用容器不暴露端口，通过 Docker 网络通信
- 💾 **数据备份**: 内置备份功能

## 🏗️ 架构说明

### 网络架构

```
Internet (80/443)
    ↓
Caddy (反向代理 + SSL)
    ↓
Docker Network (vupmusic-network)
    ↓
应用容器 (app1, app2, app3...)
    ↓
数据卷 (独立存储)
```

### 目录结构

```
/opt/vupmusic/
├── manage.sh           # 管理脚本
├── caddy/              # Caddy 配置和数据
│   ├── Caddyfile       # 自动生成的配置文件
│   ├── data/           # SSL 证书存储
│   ├── config/         # Caddy 配置
│   └── docker-compose.yml
└── apps/               # 应用实例
    ├── music1/         # 应用1
    │   ├── domain.txt
    │   ├── docker-compose.yml
    │   └── data/       # 数据库和上传文件
    ├── music2/         # 应用2
    │   ├── domain.txt
    │   ├── docker-compose.yml
    │   └── data/
    └── ...
```

## 🚀 快速开始

### 方式一：一键安装（推荐）

在 Linux 服务器上执行：

```bash
curl -fsSL https://raw.githubusercontent.com/你的仓库/main/install.sh | sudo bash
```

安装完成后运行：

```bash
vupmusic
```

### 方式二：手动安装

1. 确保已安装 Docker 和 Docker Compose
2. 下载管理脚本：

```bash
sudo mkdir -p /opt/vupmusic
cd /opt/vupmusic
sudo curl -fsSL https://raw.githubusercontent.com/你的仓库/main/manage.sh -o manage.sh
sudo chmod +x manage.sh
```

3. 运行管理脚本：

```bash
sudo ./manage.sh
```

## 📋 功能说明

### 1. 列出所有应用

显示所有已创建的应用及其状态：
- 应用名称
- 绑定域名
- 运行状态

### 2. 添加新应用

创建一个新的歌单应用实例：

**步骤：**
1. 输入应用名称（如 `music1`，只能包含字母、数字、下划线和连字符）
2. 输入域名（如 `music1.example.com`）
3. 系统自动：
   - 创建应用目录和数据卷
   - 生成 docker-compose.yml
   - 启动应用容器
   - 更新 Caddyfile 配置
   - 重启 Caddy

**注意事项：**
- 确保域名已解析到服务器 IP
- 首次申请 SSL 证书可能需要几分钟
- 应用启动后访问 `https://your-domain.com` 进入安装向导

### 3. 删除应用

删除一个应用实例及其所有数据：

**警告：** 此操作会永久删除应用数据，不可恢复！

**步骤：**
1. 选择要删除的应用
2. 输入 `yes` 确认
3. 系统自动：
   - 停止并删除容器
   - 删除应用数据
   - 更新 Caddyfile
   - 重启 Caddy

### 4. 重命名应用

修改应用的名称（不影响数据）：

**步骤：**
1. 输入旧应用名称
2. 输入新应用名称
3. 系统自动：
   - 停止旧容器
   - 重命名目录和配置
   - 启动新容器
   - 更新 Caddyfile

### 5. 修改域名

修改应用绑定的域名：

**步骤：**
1. 选择要修改的应用
2. 输入新域名
3. 系统自动更新 Caddyfile 和 Caddy

**注意：** 需要确保新域名已解析到服务器

### 6. 启动应用

启动一个或所有应用：
- 输入应用名称启动单个应用
- 留空启动所有应用

### 7. 停止应用

停止一个或所有应用：
- 输入应用名称停止单个应用
- 留空停止所有应用

### 8. 查看日志

实时查看应用的运行日志：
- 显示最近 100 条日志
- 实时滚动更新
- 按 `Ctrl+C` 退出

### 9. 备份应用

备份应用的所有数据：
- 包含数据库、上传文件、配置
- 保存为 tar.gz 压缩包
- 存储在 `/opt/vupmusic/backups/`

### 10. 重启 Caddy

重新生成 Caddyfile 并重启 Caddy：
- 用于手动修复配置问题
- 添加或删除应用后自动执行

## 🌐 域名配置

### DNS 解析

每个应用需要独立的域名或子域名，在添加应用前需要配置 DNS 解析：

```
# A 记录示例
music1.example.com    A    1.2.3.4
music2.example.com    A    1.2.3.4
music3.example.com    A    1.2.3.4
```

或使用泛域名：

```
*.music.example.com   A    1.2.3.4
```

### SSL 证书

Caddy 会自动为每个域名申请 Let's Encrypt SSL 证书：

- ✅ 自动申请
- ✅ 自动续期（到期前 30 天）
- ✅ 自动 HTTPS 重定向
- ✅ 支持多域名

**要求：**
- 域名必须已正确解析
- 服务器 80 和 443 端口必须开放
- 域名必须是公网可访问的

## 🔧 配置说明

### Caddyfile 配置

系统自动生成，格式如下：

```caddy
# music1
music1.example.com {
    reverse_proxy music1:3001
    encode gzip
    
    log {
        output file /var/log/caddy/music1.log
        format json
    }
}

# music2
music2.example.com {
    reverse_proxy music2:3001
    encode gzip
    
    log {
        output file /var/log/caddy/music2.log
        format json
    }
}
```

### 环境变量

每个应用的环境变量在 `docker-compose.yml` 中配置：

```yaml
environment:
  - NODE_ENV=production
  - PORT=3001
  - DATA_DIR=/data
  - SESSION_SECRET=随机生成的密钥
```

## 🔒 安全建议

1. **防火墙配置**：只开放必要的端口
   ```bash
   # Ubuntu/Debian
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   
   # CentOS/RHEL
   sudo firewall-cmd --permanent --add-port=80/tcp
   sudo firewall-cmd --permanent --add-port=443/tcp
   sudo firewall-cmd --reload
   ```

2. **定期备份**：使用备份功能定期备份数据

3. **更新镜像**：定期更新 Docker 镜像
   ```bash
   docker pull mywltd/vup-music:latest
   # 然后重启应用
   ```

4. **监控日志**：定期检查应用和 Caddy 日志

5. **限制访问**：可以通过 Caddy 配置 IP 白名单或 HTTP 认证

## 🔥 常见问题

### Q1: SSL 证书申请失败？

**可能原因：**
- 域名未正确解析
- 80 端口未开放
- 域名不是公网可访问的

**解决方法：**
1. 检查域名解析：`nslookup your-domain.com`
2. 检查端口：`sudo netstat -tlnp | grep :80`
3. 查看 Caddy 日志：`docker logs vupmusic-caddy`

### Q2: 应用无法访问？

**检查步骤：**
1. 检查容器状态：`docker ps`
2. 检查应用日志：选择菜单 8
3. 检查 Caddy 配置：`cat /opt/vupmusic/caddy/Caddyfile`
4. 检查网络：`docker network inspect vupmusic-network`

### Q3: 如何迁移到新服务器？

**步骤：**
1. 在新服务器安装管理脚本
2. 在旧服务器备份所有应用
3. 将备份文件传输到新服务器
4. 在新服务器解压备份到 `/opt/vupmusic/apps/`
5. 配置域名解析到新服务器
6. 启动应用

### Q4: 可以使用 IP 地址访问吗？

不建议。Caddy 的自动 SSL 需要域名。如果必须使用 IP，需要手动配置 Caddy 不使用 HTTPS。

### Q5: 如何限制管理后台访问？

可以在 Caddy 配置中添加 IP 白名单或 HTTP 基本认证：

```caddy
music1.example.com {
    # IP 白名单
    @admin {
        path /admin*
        not remote_ip 1.2.3.4
    }
    respond @admin 403
    
    reverse_proxy music1:3001
}
```

## 📊 性能优化

### 资源限制

可以在 docker-compose.yml 中限制容器资源：

```yaml
services:
  music1:
    # ...
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          memory: 256M
```

### 数据库优化

SQLite 已启用 WAL 模式，适合并发访问。如需更高性能，可考虑：
- 使用 SSD 存储
- 定期清理旧数据
- 增加服务器内存

## 🔄 更新和维护

### 更新应用

```bash
# 拉取最新镜像
docker pull mywltd/vup-music:latest

# 重启所有应用
vupmusic
# 选择 7 停止所有应用
# 选择 6 启动所有应用
```

### 更新管理脚本

```bash
cd /opt/vupmusic
sudo curl -fsSL https://raw.githubusercontent.com/你的仓库/main/manage.sh -o manage.sh
sudo chmod +x manage.sh
```

### 清理未使用的资源

```bash
# 清理未使用的镜像
docker image prune -a

# 清理未使用的卷
docker volume prune
```

## 📞 技术支持

如遇到问题：
1. 查看日志定位问题
2. 参考常见问题部分
3. 提交 Issue 到 GitHub
4. 加入社区讨论

## 🎯 最佳实践

1. **命名规范**：使用有意义的应用名称，如 `music-artist1`, `music-artist2`
2. **域名规范**：使用子域名区分，如 `artist1.music.example.com`
3. **定期备份**：建议每周备份一次
4. **监控资源**：监控服务器 CPU、内存、磁盘使用情况
5. **日志管理**：定期清理旧日志文件
6. **安全更新**：及时更新 Docker 和系统安全补丁

## 🚀 高级用法

### 使用自定义镜像

修改 `/opt/vupmusic/apps/应用名/docker-compose.yml`：

```yaml
services:
  music1:
    image: your-registry/your-image:tag
    # ...
```

### 添加额外配置

可以在 Caddyfile 中添加自定义配置，如缓存、压缩等。

### 多服务器部署

使用 Docker Swarm 或 Kubernetes 实现跨服务器部署和负载均衡。

---

**版本**: v2.0.0  
**更新日期**: 2026-01-31  
**作者**: FallSakura

