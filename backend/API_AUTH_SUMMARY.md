# API 权限管理总结

## 认证方式
- **JWT Token认证**：所有需要认证的接口必须携带 `Authorization: Bearer <token>` 请求头

## 需要认证的接口（requireAuth）

### 歌单管理接口 (`/api/playlist`)
- ✅ `POST /api/playlist/add` - 添加歌曲
- ✅ `PUT /api/playlist/edit/:id` - 更新歌曲
- ✅ `DELETE /api/playlist/delete/:id` - 删除歌曲
- ✅ `POST /api/playlist/import` - 导入歌单
- ✅ `GET /api/playlist/export` - 导出歌单
- ✅ `DELETE /api/playlist/clear` - 清空歌单

### 站点管理接口 (`/api/site`)
- ✅ `PUT /api/site/config` - 更新站点配置
- ✅ `PUT /api/site/streamer` - 更新主播信息
- ✅ `POST /api/site/upload` - 上传文件

### 认证接口 (`/api/auth`)
- ✅ `POST /api/auth/change-password` - 修改密码

## 公开接口（无需认证）

### 歌单查询接口 (`/api/playlist`)
- ✅ `GET /api/playlist` - 获取歌单列表
- ✅ `GET /api/playlist/languages` - 获取语种列表
- ✅ `GET /api/playlist/first-letters` - 获取首字母列表

### 站点接口 (`/api/site`)
- ✅ `GET /api/site/meta` - 获取站点元数据

### 认证接口 (`/api/auth`)
- ✅ `POST /api/auth/login` - 登录
- ✅ `POST /api/auth/logout` - 退出登录
- ✅ `GET /api/auth/status` - 检查登录状态（使用verifyToken，可选认证）

### 安装接口 (`/api/setup`)
- ✅ `GET /api/setup/status` - 检查安装状态
- ✅ `POST /api/setup/install` - 执行安装

### 健康检查
- ✅ `GET /api/health` - 健康检查

## 中间件说明

### requireAuth
- **功能**：强制要求JWT token认证
- **验证**：
  - 检查Authorization头是否存在
  - 检查Authorization头格式是否为 "Bearer <token>"
  - 验证JWT token的有效性
  - 验证token payload是否包含必要字段（id, username）
- **错误处理**：
  - Token过期：返回401，错误信息"Token已过期，请重新登录"
  - Token无效：返回401，错误信息"无效的Token，请重新登录"
  - 未提供token：返回401，错误信息"未授权，请先登录"

### verifyToken
- **功能**：可选认证，验证token但不强制要求
- **用途**：用于 `/api/auth/status` 接口，允许未登录用户查询状态

## 安全建议

1. **生产环境**：必须设置强密钥 `JWT_SECRET`
2. **Token过期时间**：建议设置为合理的时间（默认7天）
3. **HTTPS**：生产环境必须使用HTTPS传输token
4. **日志记录**：认证失败会记录警告日志，便于排查问题

