import express from 'express';
import session from 'express-session';
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
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Session 配置
app.use(session({
  secret: process.env.SESSION_SECRET || 'vup-music-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24小时
  }
}));

// 静态文件服务（上传的文件）
app.use('/uploads', express.static(path.join(DATA_DIR, 'uploads')));

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
    timestamp: new Date().toISOString()
  });
});

// 前端静态文件（生产环境）
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../frontend/build');
  app.use(express.static(frontendPath));

  app.get('*', (req, res) => {
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

