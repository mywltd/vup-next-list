# GitHub Repository Secrets 配置指南

本文档说明如何为 VUP 音乐歌单系统配置 GitHub Actions 所需的 Repository Secrets。

## 📝 概述

本项目使用 **Repository Secrets**（仓库密钥）来存储敏感信息，而不是 Environment Secrets。Repository Secrets 的配置更简单，适合单一环境的项目。

## 🔐 需要配置的 Secrets

项目需要配置以下 2 个 Repository Secrets：

| Secret 名称 | 用途 | 获取方式 |
|------------|------|---------|
| `DOCKER_USERNAME` | Docker Hub 用户名 | 你的 Docker Hub 账号用户名 |
| `DOCKER_PASSWORD` | Docker Hub 访问令牌 | 在 Docker Hub 生成 |

**注意**: `GITHUB_TOKEN` 是 GitHub Actions 自动提供的，无需手动配置。

## 📋 配置步骤

### 步骤 1: 获取 Docker Hub 访问令牌

1. 访问 [Docker Hub](https://hub.docker.com/)
2. 登录你的账号
3. 点击右上角头像 → **Account Settings**
4. 进入 **Security** 标签页
5. 点击 **New Access Token** 按钮
6. 填写令牌信息：
   - **Description**: `GitHub Actions - VUP Music`
   - **Access permissions**: 选择 **Read, Write, Delete**
7. 点击 **Generate** 生成令牌
8. **重要**: 立即复制令牌（关闭后将无法再次查看）

### 步骤 2: 在 GitHub 仓库中配置 Secrets

1. 访问你的 GitHub 仓库
   ```
   https://github.com/mywltd/vup-next-list
   ```

2. 点击仓库顶部的 **Settings** 标签

3. 在左侧边栏找到 **Secrets and variables** → 点击 **Actions**

4. 点击 **New repository secret** 按钮

5. 添加第一个 Secret：
   - **Name**: `DOCKER_USERNAME`
   - **Secret**: 你的 Docker Hub 用户名（例如：`mywltd`）
   - 点击 **Add secret**

6. 再次点击 **New repository secret** 添加第二个 Secret：
   - **Name**: `DOCKER_PASSWORD`
   - **Secret**: 粘贴刚才生成的 Docker Hub 访问令牌
   - 点击 **Add secret**

### 步骤 3: 验证配置

配置完成后，你应该能在 Secrets 列表中看到：

```
✅ DOCKER_USERNAME
✅ DOCKER_PASSWORD
```

**注意**: Secrets 的值一旦保存就无法查看，只能更新或删除。

## 🚀 触发 GitHub Actions

配置完成后，GitHub Actions 会在以下情况自动运行：

### 1. 推送到主分支
```bash
git push origin main
```
- 构建 Docker 镜像
- 推送镜像到 Docker Hub，标签为 `latest`

### 2. 创建版本标签
```bash
git tag v1.0.1
git push origin v1.0.1
```
- 构建 Docker 镜像
- 推送镜像到 Docker Hub，标签为 `v1.0.1`, `1.0`, `1`, `latest`
- 自动创建 GitHub Release

### 3. 提交 Pull Request
- 仅构建镜像，不推送（用于测试）

## 📊 查看构建状态

1. 访问 Actions 页面：
   ```
   https://github.com/mywltd/vup-next-list/actions
   ```

2. 查看工作流运行记录和日志

3. 检查构建是否成功：
   - ✅ 绿色勾号 = 成功
   - ❌ 红色叉号 = 失败
   - 🟡 黄色圆点 = 进行中

## 🔍 故障排除

### 问题 1: "Error: Username and password required"

**原因**: 未配置 DOCKER_USERNAME 或 DOCKER_PASSWORD

**解决方案**: 
- 检查 Secrets 是否正确配置
- 确保 Secret 名称完全匹配（区分大小写）

### 问题 2: "unauthorized: incorrect username or password"

**原因**: Docker Hub 令牌无效或过期

**解决方案**:
- 重新生成 Docker Hub 访问令牌
- 更新仓库中的 DOCKER_PASSWORD Secret

### 问题 3: "denied: requested access to the resource is denied"

**原因**: Docker Hub 用户名错误或无权限

**解决方案**:
- 确认 DOCKER_USERNAME 正确
- 确保令牌有 Read, Write, Delete 权限

### 问题 4: 构建成功但未创建 Release

**原因**: 权限不足

**解决方案**:
- 检查工作流文件中的 `permissions` 设置
- 确保包含 `contents: write`

## 📝 Docker Hub 镜像命名规则

根据配置，Docker 镜像将使用以下命名：

```
<DOCKER_USERNAME>/vup-music:<tag>
```

例如，如果你的用户名是 `mywltd`：

- `mywltd/vup-music:latest` (主分支最新版本)
- `mywltd/vup-music:v1.0.0` (版本标签)
- `mywltd/vup-music:1.0` (主版本)
- `mywltd/vup-music:1` (大版本)

## 🔒 安全建议

1. **不要在代码中硬编码敏感信息**
   - ✅ 使用 Secrets
   - ❌ 直接写在 YAML 文件中

2. **定期更新 Docker Hub 令牌**
   - 建议每 6-12 个月更新一次
   - 立即更新任何疑似泄露的令牌

3. **使用最小权限原则**
   - Docker Hub 令牌只授予必要的权限
   - GitHub Actions 只申请需要的权限

4. **审查工作流日志**
   - Secrets 不会在日志中显示（被自动隐藏）
   - 定期检查构建日志以发现异常

## 📞 获取帮助

如果在配置过程中遇到问题：

1. 查看 [GitHub Actions 文档](https://docs.github.com/actions)
2. 查看 [Docker Hub 文档](https://docs.docker.com/docker-hub/)
3. 在仓库中提交 [Issue](https://github.com/mywltd/vup-next-list/issues)

## 🔗 相关链接

- [GitHub Actions - Using secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)
- [Docker Hub - Access Tokens](https://docs.docker.com/docker-hub/access-tokens/)
- [GitHub Actions - Permissions](https://docs.github.com/en/actions/security-guides/automatic-token-authentication)

---

**最后更新**: 2026-01-09  
**适用版本**: v1.0.0+

