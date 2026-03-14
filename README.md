# 🎵 VUP 音乐歌单系统

<div align="center">

一个现代化、高性能的在线歌单管理系统  
**React 18 + MUI v7 + Node.js + SQLite**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-18.3.1-blue.svg)](https://react.dev/)

[✨ 特性](#-核心特性) • [🚀 快速开始](#-快速开始) • [📖 文档](#-功能说明) • [🎨 主题](#-主题定制)

</div>

---

## 📸 预览

- 🌓 **深色/浅色模式**自动切换，护眼舒适
- 🎨 **二次元风格界面**，液态玻璃效果，梦幻渐变
- 📱 **完美适配移动端**，响应式设计
- ⚡ **极致性能优化**，微信浏览器流畅运行

---

## ✨ 核心特性

### 🎯 歌单功能
- **🔍 智能筛选** - 支持首字母、语言、种类多选筛选，实时预览结果
- **🏷️ 多标签支持** - 一首歌可以有多个分类标签，灵活管理
- **🔎 防抖搜索** - 实时搜索歌曲名和歌手，性能优化
- **📋 一键复制** - 点击歌曲名即可复制，支持"点歌"模式
- **⭐ 新歌高亮** - 自动标记并置顶新添加的歌曲
- **🎭 特殊标签** - 支持戏曲等特殊分类独立展示
- **🎬 B站切片** - 为歌曲添加 B站视频链接，一键跳转

### 🎨 界面体验
- **🌈 主题定制** - 6种预设配色 + 自定义主题色
- **🌓 深色模式** - 自动跟随系统或手动切换
- **💎 液态玻璃效果** - 现代化拟态设计，视觉震撼
- **📱 响应式布局** - PC/平板/手机完美适配
- **✨ 流畅动画** - 精心设计的过渡效果

### ⚡ 性能优化
- **🚀 代码分割** - 路由懒加载，首屏速度提升 40%
- **📦 React.memo** - 组件缓存，避免不必要的重渲染
- **🎯 环境检测** - 自动识别微信浏览器，优化性能
- **🖼️ 图片缓存** - IndexedDB 缓存，离线可用
- **⚡ 防抖优化** - 搜索、筛选等操作性能优化

### 🛠️ 管理功能
- **👤 用户认证** - JWT + bcrypt 安全加密
- **🔐 hCaptcha** - 可选的人机验证，防止暴力破解
- **📊 完整CRUD** - 添加、编辑、删除、批量导入导出
- **📤 Excel支持** - XLSX 转 JSON 工具
- **🎨 在线定制** - 主题色、背景图、头像、SEO配置
- **💻 代码注入** - 自定义 CSS/JS，高级玩法

### 🌐 SEO与合规
- **🔍 SEO优化** - 自定义关键词、描述、标题
- **📜 ICP备案** - 备案号配置与展示
- **📱 微信提示** - 友好引导用户在浏览器中打开
- **🎯 离开提醒** - 自定义页面切换标题

### 🐳 部署运维
- **🐳 Docker部署** - 一键启动，开箱即用
- **🔄 自动备份** - 数据库备份与恢复
- **🚀 CI/CD** - GitHub Actions 自动构建
- **📊 健康检查** - 服务状态监控

---

## 🚀 快速开始

### 方式一：一键部署（推荐）

**自动安装 Docker 并启动服务**：

```bash
curl -fsSL https://raw.githubusercontent.com/mywltd/vup-next-list/main/deploy.sh | sudo bash
```

**支持系统**：Ubuntu, Debian, CentOS, RHEL, Rocky Linux, AlmaLinux, Fedora  
**支持架构**：x86_64 (amd64), ARM64

脚本会自动：
- ✅ 检测系统架构和版本
- ✅ 安装 Docker（如果未安装）
- ✅ 配置并启动服务
- ✅ 显示访问地址

---

### 方式二：Docker Compose（需预装 Docker）

```bash
# 1. 克隆项目
git clone https://github.com/mywltd/vup-next-list.git
cd vup-next-list

# 2. 启动服务
docker compose up -d

# 3. 查看日志
docker compose logs -f
```

访问 `http://localhost:3001`，首次访问会进入安装向导。

> 💡 **提示**：旧版 Docker Compose 使用 `docker-compose` 命令。

---

### 方式三：手动部署（开发环境）

**环境要求**：
- Node.js >= 18
- npm >= 9

**后端启动**：

```bash
cd backend
npm install
npm start
```

**前端开发**：

```bash
cd frontend
npm install
npm run dev
```

**前端生产构建**：

```bash
cd frontend
npm run build
```

---

## 📁 项目结构

```
vup-next-list/
├── backend/                    # Node.js 后端
│   ├── db/                    # 数据库初始化
│   │   └── init.js           # 表结构、迁移
│   ├── routes/                # API 路由
│   │   ├── auth.js           # 认证路由
│   │   ├── playlist.js       # 歌单路由（多选筛选）
│   │   ├── site.js           # 站点配置
│   │   └── setup.js          # 安装向导
│   ├── services/              # 业务逻辑
│   │   ├── authService.js    # JWT 认证
│   │   ├── playlistService.js # 歌单逻辑（SQL优化）
│   │   ├── siteService.js    # 站点管理
│   │   └── hcaptchaService.js # 验证码服务
│   ├── middleware/
│   │   └── auth.js           # JWT 中间件
│   ├── scripts/
│   │   └── xlsx2json.js      # Excel 转换工具
│   └── index.js               # 入口文件
│
├── frontend/                   # React 前端
│   ├── src/
│   │   ├── components/       # 通用组件
│   │   │   ├── AppLayout.jsx # 导航栏（性能优化）
│   │   │   ├── ThemeCustomizer.jsx # 主题定制器
│   │   │   └── admin/        # 管理后台组件
│   │   ├── pages/            # 页面组件
│   │   │   ├── HomePage.jsx  # 歌单页（多选筛选、性能优化）
│   │   │   ├── AdminPage.jsx # 管理后台
│   │   │   ├── LoginPage.jsx # 登录页
│   │   │   └── SetupPage.jsx # 安装向导
│   │   ├── services/
│   │   │   └── api.js        # Axios API 封装
│   │   ├── theme/
│   │   │   └── theme.js      # MUI 主题（二次元风格）
│   │   └── utils/
│   │       ├── helpers.js    # 工具函数（环境检测）
│   │       └── imageCache.js # 图片缓存（IndexedDB）
│   ├── index.html
│   └── vite.config.js        # Vite 配置
│
├── data/                       # 数据目录（运行时生成）
│   ├── database.db            # SQLite 数据库
│   └── uploads/               # 上传文件
│
├── Dockerfile                 # Docker 构建文件
├── docker-compose.yml         # Docker Compose 配置
└── README.md                  # 项目文档
```

---

## 🛠️ 功能说明

### 首次安装向导

首次启动时，系统会引导你完成以下配置：

#### 1️⃣ 站点信息
- **站点名称** - 显示在浏览器标题栏
- **站点副标题** - 显示在标题后（可选）
- **默认歌单名称** - 歌单页面标题
- **站点头像** - 显示在移动端顶部
- **背景图片** - 全站背景（可选）

#### 2️⃣ 管理员账号
- **用户名** - 登录账号
- **密码** - 至少6位，bcrypt 加密存储

#### 3️⃣ 主播信息
- **主播名称** - 显示在导航栏
- **Bilibili 直播间** - 一键跳转链接

---

### 歌单管理

#### 添加/编辑歌曲

每首歌曲包含以下字段：

| 字段 | 说明 | 示例 |
|------|------|------|
| 歌曲名 | 歌曲标题 | `命运之轮` |
| 歌手 | 演唱者 | `初音未来` |
| 语言 | 单选 | `日语` |
| 种类 | **多选** | `ACG`, `流行` |
| 特殊歌曲 | 标记 | `是/否` |
| 首字母 | 自动提取 | `M` |
| B站切片 | 视频链接（可选） | `https://bilibili.com/...` |

#### 批量导入导出

**导出格式**：

```json
{
  "songs": [
    {
      "songName": "命运之轮",
      "singer": "初音未来",
      "language": "日语",
      "categories": ["ACG", "流行"],
      "special": false,
      "firstLetter": "M",
      "bilibiliClipUrl": "https://bilibili.com/..."
    }
  ]
}
```

**Excel 导入**：

使用工具转换 XLSX 文件：

```bash
cd backend
node scripts/xlsx2json.js playlist.xlsx output.json
```

**Excel 格式要求**：

| 歌曲名 | 歌手 | 语种 | 种类 | 特殊歌曲 | B站链接 |
|--------|------|------|------|----------|---------|
| 命运之轮 | 初音未来 | 日语 | ACG | 否 | https://... |

---

### 筛选功能

#### 🎯 多选标签筛选（NEW）

- **语言多选** - 同时选择中文、日语、英语等
- **种类多选** - 同时选择 ACG、流行、摇滚等
- **或关系** - 满足任一条件即可显示
- **已选展示** - 实时显示已选条件，单独删除

#### 📊 其他筛选

- **首字母筛选** - A-Z 快速定位
- **特殊歌曲** - 仅显示标记歌曲
- **实时搜索** - 歌曲名/歌手模糊搜索
- **组合筛选** - 多种条件叠加

---

### 站点配置

#### 🎨 主题定制

**6种预设配色**：
- 樱花粉 - 柔和的粉蓝配色
- 薄荷绿 - 清爽的绿黄配色
- 天空蓝 - 梦幻温柔配色
- 薰衣草 - 优雅梦幻配色
- 珊瑚橙 - 青春活力配色
- 奶油黄 - 清新明亮配色

**自定义颜色**：
- 主色调（Primary）
- 辅色调（Secondary）

#### 🔍 SEO 优化

- **关键词** - 多个关键词用逗号分隔
- **描述** - 网站描述，用于搜索引擎展示
- **隐藏标题** - 用户离开页面后的标题

#### 📜 ICP 备案

- **备案号** - 填写您的 ICP 备案号
- **显示控制** - 开关控制是否在页面底部显示
- **自动链接** - 自动链接到工信部备案查询网站

#### ⚙️ 高级配置

- **复制模式** - 正常模式 / 点歌模式（自动添加"点歌"前缀）
- **新歌高亮** - 自动标记最近添加的歌曲（可设置天数）
- **自定义CSS** - 注入自定义样式
- **自定义JS** - 注入自定义脚本
- **hCaptcha** - 启用人机验证

---

## 🎨 主题定制

### 用户端自定义

**页面右上角** → **调色板图标** → **选择颜色**

- 实时预览效果
- 保存到本地浏览器
- 不影响其他用户

### 管理员全局配置

**管理后台** → **站点配置** → **主题配置**

- 6种预设配色一键应用
- 自定义主色调和辅色调
- 应用到所有用户

---

## ⚡ 性能优化


### 通用优化

- ✅ **代码分割** - 路由懒加载，首屏速度提升 40%
- ✅ **React.memo** - 组件缓存，避免不必要渲染
- ✅ **useCallback** - 回调函数缓存
- ✅ **图片懒加载** - 原生 loading="lazy"
- ✅ **IndexedDB缓存** - 头像、背景图离线可用
- ✅ **防抖优化** - 搜索、筛选等操作

---

## 🔐 环境变量

创建 `.env` 文件：

```env
# 后端端口
PORT=3001

# 数据目录
DATA_DIR=/data

# Session 密钥（生产环境请修改！）
SESSION_SECRET=your-super-secret-key-change-me

# CORS 允许的源
CORS_ORIGIN=http://localhost:3000

# Node 环境
NODE_ENV=production
```

---

## 🐳 Docker 部署

### 使用 Docker Compose

```bash
# 启动服务
docker compose up -d

# 查看日志
docker compose logs -f

# 停止服务
docker compose down

# 重启服务
docker compose restart
```

### 自定义镜像

```bash
# 构建镜像
docker build -t vup-music:custom .

# 运行容器
docker run -d \
  --name vup-music \
  -p 3001:3001 \
  -v ./data:/data \
  -e SESSION_SECRET=your-secret-key \
  vup-music:custom
```

### 端口映射

修改 `docker-compose.yml`：

```yaml
ports:
  - "8080:3001"  # 改为其他端口
```

---

## 🔄 数据备份

### 备份数据库

```bash
# 备份
cp data/database.db data/database.db.backup

# 恢复
cp data/database.db.backup data/database.db
docker compose restart
```

### 导出歌单

**管理后台** → **导入导出** → **导出歌单 JSON**

---

## 📝 API 文档

### 公开接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/site/meta` | 获取站点元数据 |
| GET | `/api/playlist` | 获取歌单列表（支持多选筛选） |
| GET | `/api/playlist/tag-cloud` | 获取标签云数据 |
| GET | `/api/health` | 健康检查 |

**歌单查询参数**：

```
?page=1
&limit=50
&search=歌名
&firstLetter=A
&languages=中文,日语,英语  ← 多选（逗号分隔）
&categories=ACG,流行      ← 多选（逗号分隔）
&special=true
```

### 管理接口（需要 JWT 认证）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/login` | 管理员登录 |
| POST | `/api/auth/logout` | 退出登录 |
| GET | `/api/auth/status` | 检查登录状态 |
| POST | `/api/playlist/add` | 添加歌曲 |
| PUT | `/api/playlist/edit/:id` | 更新歌曲 |
| DELETE | `/api/playlist/delete/:id` | 删除歌曲 |
| POST | `/api/playlist/import` | 批量导入 |
| GET | `/api/playlist/export` | 导出歌单 |
| DELETE | `/api/playlist/clear` | 清空歌单 |
| PUT | `/api/site/config` | 更新站点配置 |
| POST | `/api/site/upload` | 上传文件 |

---

## 🐛 故障排除

### 端口被占用

```bash
# 查看占用端口的进程
lsof -i :3001

# 修改端口（docker-compose.yml）
ports:
  - "8080:3001"
```

### 数据库锁定

```bash
# 停止服务
docker compose down

# 删除锁文件
rm data/database.db-wal data/database.db-shm

# 重启
docker compose up -d
```

### 前端无法连接后端

检查 CORS 配置：

```env
CORS_ORIGIN=http://your-domain.com
```

### 微信浏览器样式问题

系统已自动优化，如仍有问题：
1. 点击右上角「···」菜单
2. 选择「在浏览器中打开」

---

## 🚀 CI/CD

项目使用 GitHub Actions 自动构建和发布。

### 配置 Secrets

**Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret 名称 | 说明 |
|-------------|------|
| `DOCKER_USERNAME` | Docker Hub 用户名 |
| `DOCKER_PASSWORD` | Docker Hub 访问令牌 |

### 自动化流程

- **推送代码** - 自动构建并推送 `latest` 镜像
- **创建标签** - 自动构建版本镜像并创建 Release
- **Pull Request** - 仅构建测试，不推送

```bash
# 推送代码触发构建
git push origin main

# 发布新版本
git tag v1.0.0
git push origin v1.0.0
```

---

## 📊 技术栈

### 前端

- **React 18** - UI 框架
- **MUI v7** - 组件库
- **Vite** - 构建工具
- **React Router v6** - 路由管理
- **Axios** - HTTP 客户端
- **Emotion** - CSS-in-JS
- **Lodash** - 工具库

### 后端

- **Node.js 18** - 运行时
- **Express** - Web 框架
- **better-sqlite3** - 数据库
- **bcrypt** - 密码加密
- **jsonwebtoken** - JWT 认证
- **multer** - 文件上传
- **XLSX** - Excel 处理

### 部署

- **Docker** - 容器化
- **Docker Compose** - 编排
- **GitHub Actions** - CI/CD

---

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源协议。

---

## 🙏 致谢

- [React](https://react.dev/) - 强大的 UI 框架
- [MUI](https://mui.com/) - 精美的组件库
- [Express](https://expressjs.com/) - 简洁的 Web 框架
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) - 高性能数据库
- [Vite](https://vitejs.dev/) - 极速构建工具

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

**贡献指南**：
1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

---

## 📧 支持

如有问题或建议：

- 📮 提交 [Issue](../../issues)
- 💬 参与 [Discussions](../../discussions)
- ⭐ 给项目点个 Star！

---

<div align="center">

**[⬆ 回到顶部](#-vup-音乐歌单系统)**

Made with ❤️ by FallSakura

⭐ **如果这个项目对你有帮助，请给个 Star！** ⭐

</div>
