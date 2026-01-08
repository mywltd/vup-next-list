# 安装指南

## 目录

- [快速开始](#快速开始)
- [Docker 部署](#docker-部署)
- [手动部署](#手动部署)
- [环境变量配置](#环境变量配置)
- [首次安装](#首次安装)
- [故障排除](#故障排除)

## 快速开始

### 使用一键启动脚本

**Linux / macOS:**

```bash
chmod +x start.sh
./start.sh
```

**Windows:**

双击运行 `start.bat` 或在命令行中执行：

```cmd
start.bat
```

脚本会自动：
- 检查 Docker 环境
- 创建数据目录
- 启动服务
- 显示访问地址

## Docker 部署

### 前提条件

- Docker >= 20.10
- Docker Compose >= 2.0

### 部署步骤

1. **克隆项目**

```bash
git clone https://github.com/your-username/vup-music.git
cd vup-music
```

2. **配置环境变量（可选）**

复制 `.env.example` 为 `.env` 并修改配置：

```bash
cp .env.example .env
nano .env
```

3. **启动服务**

```bash
docker-compose up -d
```

4. **查看日志**

```bash
docker-compose logs -f
```

5. **访问应用**

打开浏览器访问 `http://localhost:3001`

### Docker 命令参考

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 查看日志
docker-compose logs -f

# 查看服务状态
docker-compose ps

# 更新服务
docker-compose pull
docker-compose up -d

# 完全清理（包括数据）
docker-compose down -v
```

## 手动部署

### 前提条件

- Node.js >= 18
- npm >= 9

### 后端部署

1. **安装依赖**

```bash
cd backend
npm install
```

2. **配置环境变量**

创建 `.env` 文件：

```env
PORT=3001
DATA_DIR=../data
SESSION_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:3000
NODE_ENV=production
```

3. **启动服务**

```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

### 前端部署

#### 开发环境

```bash
cd frontend
npm install
npm run dev
```

访问 `http://localhost:3000`

#### 生产环境

1. **构建**

```bash
cd frontend
npm install
npm run build
```

2. **部署构建产物**

将 `frontend/build` 目录部署到 Web 服务器（Nginx/Apache）。

或者让后端服务静态文件：

```bash
# 后端会自动服务 frontend/build 目录
cd backend
NODE_ENV=production npm start
```

### 使用 PM2 部署

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
cd backend
pm2 start index.js --name vup-music

# 设置开机自启
pm2 startup
pm2 save

# 查看日志
pm2 logs vup-music

# 重启
pm2 restart vup-music

# 停止
pm2 stop vup-music
```

## 环境变量配置

### 后端环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `PORT` | 服务端口 | `3001` |
| `DATA_DIR` | 数据目录 | `../data` |
| `SESSION_SECRET` | Session 密钥 | - |
| `CORS_ORIGIN` | CORS 允许源 | `http://localhost:3000` |
| `NODE_ENV` | Node 环境 | `development` |

### 前端环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `VITE_API_BASE_URL` | API 地址 | `http://localhost:3001` |

## 首次安装

### 安装向导

首次访问会自动进入安装向导，需要填写：

1. **站点信息**
   - 站点名称（必填）
   - 默认歌单名称
   - 站点头像 URL（可选）
   - 背景图片 URL（可选）

2. **管理员账号**
   - 用户名（必填）
   - 密码（必填，至少6位）

3. **主播信息**
   - 主播名称（必填）
   - Bilibili 直播间地址（必填）

### 完成安装

安装完成后：
- 自动跳转到主页
- 可以访问管理后台
- 数据存储在 `data/database.db`

## 故障排除

### 端口冲突

如果端口 3001 被占用，修改 `docker-compose.yml`：

```yaml
ports:
  - "8080:3001"  # 改为其他端口
```

或修改后端 `.env` 文件：

```env
PORT=8080
```

### 权限问题

Linux/macOS 下可能需要设置数据目录权限：

```bash
chmod -R 755 data/
```

### 数据库锁定

如果遇到数据库锁定错误：

1. 停止所有服务
2. 删除临时文件：

```bash
rm data/database.db-wal
rm data/database.db-shm
```

3. 重启服务

### 前端无法连接后端

检查：
1. 后端是否正常运行
2. 端口是否正确
3. CORS 配置是否正确
4. 防火墙是否允许

### Docker 构建失败

清理 Docker 缓存：

```bash
docker system prune -a
docker-compose build --no-cache
```

### 查看详细日志

```bash
# Docker 日志
docker-compose logs -f

# 后端日志
cd backend
npm run dev  # 开发模式会显示详细日志

# 检查健康状态
curl http://localhost:3001/api/health
```

## 数据迁移

### 导出数据

1. 在管理后台导出歌单 JSON
2. 备份数据库文件：

```bash
cp data/database.db backup/database.db.$(date +%Y%m%d)
```

### 导入数据

1. 复制数据库文件到新环境的 `data/` 目录
2. 或使用管理后台导入 JSON 文件

## 升级指南

### Docker 升级

```bash
# 拉取最新镜像
docker-compose pull

# 停止旧版本
docker-compose down

# 启动新版本
docker-compose up -d
```

### 手动升级

```bash
# 备份数据
cp -r data data.backup

# 更新代码
git pull

# 更新依赖
cd backend && npm install
cd ../frontend && npm install

# 重新构建前端
cd frontend && npm run build

# 重启服务
pm2 restart vup-music
```

## 性能优化

### Nginx 反向代理

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 启用 HTTPS

使用 Let's Encrypt：

```bash
sudo certbot --nginx -d your-domain.com
```

## 更多帮助

如有其他问题，请：
- 查看 [README.md](README.md)
- 提交 [Issue](https://github.com/your-username/vup-music/issues)
- 查看项目文档

