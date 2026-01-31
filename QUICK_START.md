# 🚀 快速开始指南

## 一键安装

```bash
curl -fsSL https://raw.githubusercontent.com/你的仓库/main/install.sh | sudo bash
```

## 运行管理工具

```bash
sudo vupmusic
```

或

```bash
sudo /opt/vupmusic/manage.sh
```

## 常用操作

### 添加第一个应用

1. 运行 `sudo vupmusic`
2. 选择 `2` (添加新应用)
3. 输入应用名称，如 `music1`
4. 输入域名，如 `music1.example.com`
5. 等待部署完成
6. 访问 `https://music1.example.com`

### 查看所有应用

```bash
sudo vupmusic
# 选择 1
```

### 查看应用日志

```bash
sudo vupmusic
# 选择 8
# 输入应用名称
```

### 备份应用

```bash
sudo vupmusic
# 选择 9
# 输入应用名称
```

## 前提条件

### 域名配置

在添加应用前，确保域名已解析到服务器：

```bash
# 检查域名解析
nslookup your-domain.com
```

### 防火墙配置

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

## 目录结构

```
/opt/vupmusic/
├── manage.sh          # 管理脚本
├── caddy/             # Caddy 反向代理
│   ├── Caddyfile      # 自动生成
│   └── data/          # SSL 证书
└── apps/              # 应用实例
    ├── music1/        # 应用1
    │   ├── domain.txt
    │   └── data/      # 数据和数据库
    └── music2/        # 应用2
```

## 端口说明

- **80**: HTTP（自动重定向到 HTTPS）
- **443**: HTTPS（对外服务）
- **3001**: 应用内部端口（不暴露）

## 命令速查

| 操作 | 命令 |
|------|------|
| 运行管理工具 | `sudo vupmusic` |
| 查看容器状态 | `docker ps` |
| 查看容器资源 | `docker stats` |
| 查看 Caddy 日志 | `docker logs vupmusic-caddy` |
| 查看磁盘使用 | `df -h /opt/vupmusic` |
| 更新镜像 | `docker pull mywltd/vup-music:latest` |

## 故障排除

### SSL 证书问题

```bash
# 查看 Caddy 日志
docker logs vupmusic-caddy

# 检查域名解析
nslookup your-domain.com

# 检查 80 端口
sudo netstat -tlnp | grep :80
```

### 应用访问问题

```bash
# 查看容器状态
docker ps

# 查看应用日志
sudo vupmusic  # 选择 8

# 查看网络
docker network inspect vupmusic-network
```

### 容器启动问题

```bash
# 拉取最新镜像
docker pull mywltd/vup-music:latest

# 查看详细日志
docker logs 容器名

# 检查配置文件
cat /opt/vupmusic/apps/应用名/docker-compose.yml
```

## 使用场景

### 多个主播/艺人

```
artist1.music.example.com → 艺人1
artist2.music.example.com → 艺人2
artist3.music.example.com → 艺人3
```

### 多语言版本

```
cn.music.example.com → 中文版
en.music.example.com → 英文版
jp.music.example.com → 日文版
```

### 测试与生产

```
music.example.com      → 生产环境
test.music.example.com → 测试环境
```

## 更多信息

- 完整指南: [MULTI_APP_GUIDE.md](MULTI_APP_GUIDE.md)
- 更新说明: [DEPLOYMENT_UPDATE.md](DEPLOYMENT_UPDATE.md)
- 项目主页: [README.md](README.md)

## 获取帮助

遇到问题？
1. 查看完整文档
2. 检查日志
3. 提交 GitHub Issue

---

💡 **提示**: 首次 SSL 证书申请需要几分钟，请耐心等待。

