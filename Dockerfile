# 多阶段构建 Dockerfile

# 阶段 1: 构建前端
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# 复制前端依赖文件
COPY frontend/package*.json ./

# 安装前端依赖
RUN npm install

# 复制前端源代码
COPY frontend/ ./

# 构建前端生产版本
RUN npm run build

# 阶段 2: 构建后端
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend

# 复制后端依赖文件
COPY backend/package*.json ./

# 安装后端依赖（仅生产依赖）
RUN npm install --production

# 复制后端源代码
COPY backend/ ./

# 阶段 3: 生产镜像
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 安装必要的系统依赖
RUN apk add --no-cache \
    tzdata \
    && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
    && echo "Asia/Shanghai" > /etc/timezone \
    && apk del tzdata

# 从构建阶段复制后端代码和依赖
COPY --from=backend-builder /app/backend /app/backend

# 从构建阶段复制前端构建产物
COPY --from=frontend-builder /app/frontend/build /app/frontend/build

# 创建数据目录
RUN mkdir -p /data/uploads

# 设置环境变量
ENV NODE_ENV=production \
    PORT=3001 \
    DATA_DIR=/data

# 暴露端口
EXPOSE 3001

# 启动应用
WORKDIR /app/backend
CMD ["node", "index.js"]

