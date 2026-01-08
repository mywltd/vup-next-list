# 🎵 VUP 音乐歌单系统

一个现代化、二次元风格的在线歌单管理系统，基于 Node.js + React + MUI v7 构建。

## ✨ 特性

- 🎨 **二次元风格界面** - 液态玻璃效果，渐变色彩，优雅动画
- 🌓 **深色/浅色模式** - 自动切换主题，护眼舒适
- 🔍 **强大的筛选功能** - 支持首字母、语种、特殊歌曲筛选
- 🔎 **防抖搜索** - 实时搜索歌曲名和歌手
- 📋 **一键复制** - 点击歌曲名即可复制
- 📄 **分页浏览** - 支持浏览器前后翻页
- 🎛️ **管理后台** - 完整的歌单管理、站点配置
- 📦 **导入导出** - JSON 格式备份和恢复
- 🔧 **XLSX 转换工具** - 快速将 Excel 转换为 JSON
- 🐳 **Docker 部署** - 一键启动，开箱即用
- 🚀 **CI/CD** - 自动构建和发布

## 🚀 快速开始

### 方式一：一键部署（推荐，自动安装 Docker）

在 Linux 服务器上执行：

```bash
curl -fsSL https://raw.githubusercontent.com/mywltd/vup-next-list/main/deploy.sh | sudo bash
```

**脚本会自动**：
- ✅ 检测系统架构和版本（Ubuntu, Debian, CentOS等）
- ✅ 自动安装 Docker（如果未安装）
- ✅ 配置并启动服务
- ✅ 显示访问地址

**支持系统**：Ubuntu, Debian, CentOS, RHEL, Rocky Linux, AlmaLinux, Fedora  
**支持架构**：x86_64 (amd64), ARM64

### 方式二：使用 Docker Compose（需要预装 Docker）

1. 克隆项目

```bash
git clone https://github.com/mywltd/vup-next-list.git
cd vup-next-list
```

2. 启动服务

```bash
docker compose up -d
```

> **注意**：如果你使用的是旧版 Docker Compose V1，请使用 `docker-compose` 命令。

3. 访问应用

打开浏览器访问 `http://localhost:3001`

首次访问会进入安装向导，填写站点信息即可完成初始化。

### 方式三：手动部署（开发环境）

#### 环境要求

- Node.js >= 18
- npm >= 9

#### 后端部署

```bash
cd backend
npm install
npm start
```

后端将在 `http://localhost:3001` 启动。

#### 前端开发

```bash
cd frontend
npm install
npm run dev
```

前端开发服务器将在 `http://localhost:3000` 启动。

#### 前端生产构建

```bash
cd frontend
npm run build
```

构建产物将输出到 `frontend/build` 目录。

## 📁 项目结构

```
.
├── backend/                 # Node.js 后端
│   ├── db/                 # 数据库初始化
│   ├── routes/             # API 路由
│   ├── services/           # 业务逻辑
│   ├── middleware/         # 中间件
│   ├── scripts/            # 工具脚本
│   └── index.js            # 入口文件
├── frontend/               # React 前端
│   ├── src/
│   │   ├── components/    # 组件
│   │   ├── pages/         # 页面
│   │   ├── theme/         # 主题配置
│   │   ├── services/      # API 服务
│   │   └── utils/         # 工具函数
│   └── vite.config.js     # Vite 配置
├── data/                   # 数据目录（运行时生成）
│   ├── database.db        # SQLite 数据库
│   └── uploads/           # 上传文件
├── Dockerfile             # Docker 构建文件
├── docker-compose.yml     # Docker Compose 配置
└── README.md             # 项目文档
```

## 🛠️ 功能说明

### 首次安装

首次启动时，系统会引导你完成以下配置：

1. **站点信息**
   - 站点名称
   - 默认歌单名称
   - 站点头像（可选）
   - 背景图片（可选）

2. **管理员账号**
   - 用户名
   - 密码（至少6位）

3. **主播信息**
   - 主播名称
   - Bilibili 直播间地址

### 歌单管理

管理员登录后可以：

- ➕ 添加歌曲
- ✏️ 编辑歌曲
- 🗑️ 删除歌曲
- 📥 导入 JSON 格式歌单
- 📤 导出歌单为 JSON
- 🧹 清空歌单

### 歌单数据格式

每首歌曲包含以下字段：

```json
{
  "songName": "歌曲名",
  "singer": "歌手",
  "language": "语种",
  "category": "种类",
  "special": false,
  "firstLetter": "S"
}
```

### XLSX 转 JSON 工具

将 Excel 歌单转换为 JSON 格式：

```bash
cd backend
node scripts/xlsx2json.js playlist.xlsx output.json
```

**Excel 格式要求：**

| 歌曲名 | 歌手 | 语种 | 种类 | 特殊歌曲 |
|--------|------|------|------|----------|
| 命运之轮 | VUPA | 日语 | ACG | 否 |

## 🎨 主题定制

管理员可以在后台自定义主题色：

- 主色调（Primary Color）
- 辅色调（Secondary Color）

系统会自动生成渐变效果，并应用到所有界面元素。

## 🔐 环境变量

可以在 `.env` 文件中配置以下环境变量：

```env
# 后端端口
PORT=3001

# 数据目录
DATA_DIR=/data

# Session 密钥（生产环境请修改）
SESSION_SECRET=your-secret-key

# CORS 允许的源
CORS_ORIGIN=http://localhost:3000
```

## 🐳 Docker 配置

### 使用预构建镜像

```bash
docker pull your-dockerhub-username/vup-music:latest

docker run -d \
  --name vup-music \
  -p 3001:3001 \
  -v ./data:/data \
  -e SESSION_SECRET=your-secret-key \
  your-dockerhub-username/vup-music:latest
```

### 自定义构建

```bash
# 使用 docker compose 构建
docker compose build

# 或使用 docker build
docker build -t vup-music:custom .
docker run -d --name vup-music -p 3001:3001 -v ./data:/data vup-music:custom
```

## 🔄 数据备份

### 备份数据库

```bash
cp data/database.db data/database.db.backup
```

### 导出歌单

在管理后台的「导入导出」页面点击「导出歌单 JSON」。

### 恢复数据

1. 停止服务
2. 替换 `data/database.db` 文件
3. 重启服务

或使用导入功能恢复 JSON 格式的歌单。

## 🚀 CI/CD

项目使用 GitHub Actions 自动构建和发布。所有敏感信息使用 **Repository Secrets** 存储。

### 配置 Repository Secrets

> 📖 **详细配置指南**: [.github/SECRETS_SETUP.md](.github/SECRETS_SETUP.md)

1. 在 GitHub 仓库设置中添加 **Repository Secrets**：
   - 进入 `Settings` → `Secrets and variables` → `Actions`
   - 点击 `New repository secret` 添加以下 Secrets：
     - `DOCKER_USERNAME`: 你的 Docker Hub 用户名
     - `DOCKER_PASSWORD`: Docker Hub 访问令牌（在 Docker Hub 生成）

2. 推送代码到 `main` 或 `master` 分支，自动触发构建：

```bash
git push origin main
```

3. 创建版本标签发布新版本：

```bash
git tag v1.0.1
git push origin v1.0.1
```

### 自动化流程

- ✅ **推送代码**: 自动构建并推送 `latest` 镜像
- ✅ **创建标签**: 自动构建多个版本标签并创建 GitHub Release
- ✅ **提交 PR**: 仅构建测试，不推送镜像

### 查看构建状态

访问 [Actions 页面](../../actions) 查看构建日志和状态。

## 📝 API 文档

### 公开接口

- `GET /api/site/meta` - 获取站点元数据
- `GET /api/playlist` - 获取歌单列表
- `GET /api/playlist/languages` - 获取语种列表
- `GET /api/playlist/first-letters` - 获取首字母列表

### 管理接口（需要登录）

- `POST /api/auth/login` - 管理员登录
- `POST /api/auth/logout` - 退出登录
- `GET /api/auth/status` - 检查登录状态
- `POST /api/playlist/add` - 添加歌曲
- `PUT /api/playlist/edit/:id` - 更新歌曲
- `DELETE /api/playlist/delete/:id` - 删除歌曲
- `POST /api/playlist/import` - 导入歌单
- `GET /api/playlist/export` - 导出歌单
- `PUT /api/site/config` - 更新站点配置
- `PUT /api/site/streamer` - 更新主播信息
- `POST /api/site/upload` - 上传文件

## 🐛 故障排除

### 端口被占用

修改 `docker-compose.yml` 中的端口映射：

```yaml
ports:
  - "8080:3001"  # 将 3001 改为其他端口
```

### 数据库锁定

停止所有实例，删除 `data/database.db-wal` 和 `data/database.db-shm` 文件。

### 前端无法连接后端

检查 CORS 配置，确保 `CORS_ORIGIN` 包含前端地址。

## 📄 许可证

MIT License

## 🙏 致谢

- [React](https://react.dev/)
- [MUI](https://mui.com/)
- [Express](https://expressjs.com/)
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式

如有问题，请提交 Issue 或发送邮件至 your-email@example.com

---

⭐ 如果这个项目对你有帮助，请给个 Star！

