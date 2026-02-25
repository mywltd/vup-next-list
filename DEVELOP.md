# 本地开发指南

## 环境要求

- Node.js >= 18
- npm >= 9

## 启动前后端

### 1. 启动后端

```bash
cd backend
npm install
npm run dev
```

后端将运行在 **http://localhost:3001**，使用 `nodemon` 实现热重载。

### 2. 启动前端（另开终端）

```bash
cd frontend
npm install
npm run dev
```

前端将运行在 **http://localhost:3000**，Vite 会代理 `/api` 和 `/uploads` 到后端。

### 3. 访问应用

浏览器打开 **http://localhost:3000** 进行调试。

---

## 调试说明

- **后端热重载**：修改 `backend/` 下文件后自动重启
- **前端热更新**：修改 `frontend/src/` 后自动刷新
- **API 代理**：前端请求 `/api/*` 会转发到 `localhost:3001`，无需配置 CORS
- **首次运行**：若数据库未初始化，访问首页会跳转到安装向导

---

## 推送到 GitHub 触发 Docker 构建

### 1. 提交并推送代码

```bash
git add .
git commit -m "feat: 移除微信拦截，优化低性能环境"
git push origin main
```

### 2. 自动构建

推送至 `main` 或 `master` 分支后，GitHub Actions 会自动：

- 构建 Docker 镜像（linux/amd64、linux/arm64）
- 推送到 Docker Hub（需已配置 `DOCKER_USERNAME`、`DOCKER_PASSWORD` Secrets）

### 3. 发布版本（可选）

创建版本标签可触发版本构建并生成 Release：

```bash
git tag v1.0.0
git push origin v1.0.0
```

### 4. 配置 Docker Hub Secrets

在 GitHub 仓库：**Settings → Secrets and variables → Actions** 中新增：

| Secret 名称    | 说明               |
|---------------|--------------------|
| `DOCKER_USERNAME` | Docker Hub 用户名  |
| `DOCKER_PASSWORD` | Docker Hub 访问令牌 |
