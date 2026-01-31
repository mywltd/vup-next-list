# 部署系统更新说明

## 🎉 新功能概览

本次更新重构了部署系统，添加了企业级的多应用管理功能。

## ✨ 核心改进

### 1. 多应用支持
- 在一台服务器上部署多个独立的歌单应用
- 每个应用对应不同的域名
- 数据完全隔离，互不影响

### 2. Caddy 反向代理
- 自动 SSL 证书申请和续期
- 统一入口，80/443 端口管理
- 自动 HTTPS 重定向
- 支持多域名

### 3. 端口复用
- 应用容器不暴露端口到宿主机
- 通过 Docker 内部网络通信
- 提高安全性

### 4. 交互式管理
- 友好的菜单界面
- 无需手动编辑配置文件
- 支持应用的增删改查
- 内置备份功能

## 📁 新增文件

```
manage.sh              # 核心管理脚本
install.sh             # 一键安装脚本
MULTI_APP_GUIDE.md     # 详细使用指南
DEPLOYMENT_UPDATE.md   # 本文档
```

## 🚀 快速开始

### 安装

```bash
# 方式1: 一键安装
curl -fsSL https://raw.githubusercontent.com/你的仓库/main/install.sh | sudo bash

# 方式2: 手动下载
sudo mkdir -p /opt/vupmusic
cd /opt/vupmusic
sudo curl -fsSL https://raw.githubusercontent.com/你的仓库/main/manage.sh -o manage.sh
sudo chmod +x manage.sh
```

### 使用

```bash
# 运行管理工具
sudo /opt/vupmusic/manage.sh

# 或使用快捷命令（一键安装后）
sudo vupmusic
```

### 创建第一个应用

1. 运行管理工具
2. 选择 `2. 添加新应用`
3. 输入应用名称（如 `music1`）
4. 输入域名（如 `music1.example.com`）
5. 等待自动部署完成
6. 访问 `https://music1.example.com` 完成初始化

## 📋 功能菜单

```
1. 列出所有应用    - 查看所有应用和状态
2. 添加新应用      - 创建新的歌单应用
3. 删除应用        - 删除应用及数据
4. 重命名应用      - 修改应用名称
5. 修改域名        - 修改应用绑定的域名
6. 启动应用        - 启动单个或全部应用
7. 停止应用        - 停止单个或全部应用
8. 查看日志        - 实时查看应用日志
9. 备份应用        - 备份应用数据
10. 重启 Caddy     - 重新加载 Caddy 配置
0. 退出
```

## 🏗️ 架构说明

### 网络拓扑

```
Internet
    ↓ (80, 443)
Caddy 反向代理
    ↓ (Docker Network)
应用容器 1 (music1:3001)
应用容器 2 (music2:3001)
应用容器 3 (music3:3001)
    ...
```

### 目录结构

```
/opt/vupmusic/
├── manage.sh                      # 管理脚本
├── caddy/                         # Caddy 配置
│   ├── Caddyfile                  # 自动生成
│   ├── data/                      # SSL 证书
│   ├── config/
│   └── docker-compose.yml
└── apps/                          # 应用目录
    ├── music1/                    # 应用1
    │   ├── domain.txt             # 域名配置
    │   ├── docker-compose.yml     # 容器配置
    │   └── data/                  # 数据库和文件
    │       ├── database.db
    │       └── uploads/
    ├── music2/                    # 应用2
    └── ...
```

## 🔧 配置示例

### 自动生成的 Caddyfile

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

### 应用的 docker-compose.yml

```yaml
version: '3.8'

services:
  music1:
    image: mywltd/vup-music:latest
    container_name: music1
    restart: unless-stopped
    volumes:
      - ./data:/data
    environment:
      - NODE_ENV=production
      - PORT=3001
      - DATA_DIR=/data
      - SESSION_SECRET=自动生成的密钥
    networks:
      - vupmusic-network

networks:
  vupmusic-network:
    external: true
```

## ⚠️ 注意事项

### 域名配置
- 每个应用需要独立的域名或子域名
- 域名必须解析到服务器 IP
- 首次 SSL 申请需要几分钟

### 防火墙设置
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

### 端口说明
- **80**: HTTP，自动重定向到 HTTPS
- **443**: HTTPS，对外提供服务
- **3001**: 应用内部端口，不暴露到宿主机

## 🔄 从旧部署迁移

### 如果已有单应用部署

1. 备份现有数据：
```bash
docker compose exec vup-music sh -c "tar -czf /data/backup.tar.gz /data"
docker cp vup-music:/data/backup.tar.gz ./
```

2. 停止旧容器：
```bash
docker compose down
```

3. 安装新管理系统：
```bash
curl -fsSL https://raw.githubusercontent.com/你的仓库/main/install.sh | sudo bash
```

4. 创建新应用并恢复数据：
```bash
sudo vupmusic
# 选择 2. 添加新应用
# 配置域名
# 恢复备份数据到 /opt/vupmusic/apps/应用名/data/
```

## 📈 扩展性

### 支持的应用数量
- 理论上无限制
- 实际取决于服务器资源
- 建议每个应用分配：
  - CPU: 0.5 核
  - 内存: 512MB
  - 磁盘: 2GB+（根据数据量）

### 性能考虑
- 每个应用独立容器，互不影响
- Caddy 自动处理 HTTP/2 和压缩
- 建议使用 SSD 存储
- 可配置资源限制

## 🔒 安全特性

1. **容器隔离**: 每个应用独立容器和数据卷
2. **网络隔离**: 应用间通过专用 Docker 网络通信
3. **自动 HTTPS**: Let's Encrypt SSL 证书
4. **端口安全**: 应用端口不暴露到公网
5. **定期备份**: 内置备份功能

## 📚 相关文档

- [完整使用指南](MULTI_APP_GUIDE.md)
- [原始 README](README.md)
- [新歌功能说明](NEW_SONG_FEATURE.md)
- [安装文档](INSTALL.md)

## 🐛 故障排除

### 问题：SSL 证书申请失败
**解决**:
1. 检查域名解析：`nslookup your-domain.com`
2. 检查 80 端口：`sudo netstat -tlnp | grep :80`
3. 查看日志：`docker logs vupmusic-caddy`

### 问题：应用无法访问
**解决**:
1. 检查容器状态：`docker ps`
2. 查看应用日志（菜单选项 8）
3. 检查 Caddyfile：`cat /opt/vupmusic/caddy/Caddyfile`

### 问题：容器启动失败
**解决**:
1. 检查镜像：`docker images | grep vup-music`
2. 拉取最新镜像：`docker pull mywltd/vup-music:latest`
3. 查看错误日志：`docker logs 容器名`

## 🎯 使用场景

### 场景1: 多个VUP/主播
为每个主播创建独立的歌单应用，使用不同域名。

```
artist1.music.example.com → 主播1的歌单
artist2.music.example.com → 主播2的歌单
artist3.music.example.com → 主播3的歌单
```

### 场景2: 多语言/多地区
为不同语言或地区创建独立应用。

```
cn.music.example.com → 中文歌单
en.music.example.com → 英文歌单
jp.music.example.com → 日文歌单
```

### 场景3: 测试和生产环境
在同一服务器上运行测试和生产版本。

```
music.example.com      → 生产环境
test.music.example.com → 测试环境
```

## 📊 监控建议

### 服务器监控
```bash
# 查看容器资源使用
docker stats

# 查看磁盘使用
df -h /opt/vupmusic

# 查看 Caddy 状态
docker logs vupmusic-caddy --tail 100
```

### 应用监控
使用管理工具的"查看日志"功能实时监控应用状态。

## 🔄 更新维护

### 更新应用镜像
```bash
# 拉取最新镜像
docker pull mywltd/vup-music:latest

# 使用管理工具重启应用
sudo vupmusic
# 选择 7 停止应用
# 选择 6 启动应用
```

### 更新管理脚本
```bash
cd /opt/vupmusic
sudo curl -fsSL https://raw.githubusercontent.com/你的仓库/main/manage.sh -o manage.sh
sudo chmod +x manage.sh
```

## 💡 最佳实践

1. **命名规范**: 使用有意义的名称，如 `music-艺人名`
2. **定期备份**: 建议每周备份所有应用
3. **监控日志**: 定期检查应用和 Caddy 日志
4. **资源监控**: 监控服务器 CPU、内存、磁盘
5. **安全更新**: 及时更新系统和 Docker

## 📞 获取帮助

- 查看详细文档：[MULTI_APP_GUIDE.md](MULTI_APP_GUIDE.md)
- 提交 Issue：GitHub Issues
- 社区讨论：GitHub Discussions

---

**版本**: v2.0.0  
**发布日期**: 2026-01-31  
**作者**: FallSakura

