import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { initDatabase, isInstalled } from './db/init.js';

// 路由
import setupRouter from './routes/setup.js';
import authRouter from './routes/auth.js';
import playlistRouter from './routes/playlist.js';
import siteRouter from './routes/site.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../data');

// 初始化数据库
initDatabase();

// 中间件
// CORS 配置 - 生产环境允许所有来源（同域部署）
const corsOptions = {
  origin: process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'production' ? true : 'http://localhost:3000'),
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 静态文件服务（上传的文件）- 必须在API路由之前注册
app.use('/uploads', express.static(path.join(DATA_DIR, 'uploads'), {
  maxAge: '1y', // 缓存1年
  etag: true,
  lastModified: true,
}));

// API 路由
app.use('/api/setup', setupRouter);
app.use('/api/auth', authRouter);
app.use('/api/playlist', playlistRouter);
app.use('/api/site', siteRouter);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    installed: isInstalled(),
    timestamp: new Date().toISOString(),
    dataDir: DATA_DIR,
    uploadsDir: path.join(DATA_DIR, 'uploads'),
  });
});

// 前端静态文件（生产环境）- 必须在最后注册，避免拦截API和上传文件
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../frontend/build');
  app.use(express.static(frontendPath));

  // 只对非API和非上传路径返回前端页面
  app.get('*', (req, res, next) => {
    // 跳过API路由和上传文件路径
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// 错误处理
app.use((err, req, res, next) => {
  console.error('错误:', err);
  res.status(500).json({
    error: err.message || '服务器内部错误'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   🎵 VUP 音乐歌单系统已启动           ║
║   端口: ${PORT}                         ║
║   数据目录: ${DATA_DIR}                ║
║   安装状态: ${isInstalled() ? '✅ 已安装' : '❌ 未安装'}            ║
╚════════════════════════════════════════╝
  `);
});

export default app;

