import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'vup-music-jwt-secret-key-change-in-production';

// 认证中间件 - JWT验证（强制要求）
export function requireAuth(req, res, next) {
  try {
    // 从请求头获取token
    const authHeader = req.headers.authorization;
    
    // 严格检查Authorization头
    if (!authHeader) {
      console.warn(`[AUTH] 未提供Authorization头 - ${req.method} ${req.path}`);
      return res.status(401).json({ error: '未授权，请先登录' });
    }
    
    if (!authHeader.startsWith('Bearer ')) {
      console.warn(`[AUTH] Authorization头格式错误 - ${req.method} ${req.path}`);
      return res.status(401).json({ error: '未授权，请先登录' });
    }

    const token = authHeader.substring(7); // 移除 "Bearer " 前缀
    
    // 检查token是否为空
    if (!token || token.trim() === '') {
      console.warn(`[AUTH] Token为空 - ${req.method} ${req.path}`);
      return res.status(401).json({ error: '未授权，请先登录' });
    }
    
    // 验证token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 验证token payload是否包含必要字段
    if (!decoded.id || !decoded.username) {
      console.warn(`[AUTH] Token payload不完整 - ${req.method} ${req.path}`);
      return res.status(401).json({ error: '无效的Token，请重新登录' });
    }
    
    // 将用户信息附加到请求对象
    req.admin = {
      id: decoded.id,
      username: decoded.username
    };
    
    // 记录认证成功（仅在开发环境）
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[AUTH] 认证成功 - 用户: ${decoded.username} - ${req.method} ${req.path}`);
    }
    
    next();
  } catch (error) {
    // 记录认证失败
    console.warn(`[AUTH] 认证失败 - ${req.method} ${req.path} - ${error.name}: ${error.message}`);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token已过期，请重新登录' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: '无效的Token，请重新登录' });
    } else if (error.name === 'NotBeforeError') {
      return res.status(401).json({ error: 'Token尚未生效' });
    }
    return res.status(401).json({ error: '未授权，请先登录' });
  }
}

// 验证token（不强制要求，用于可选认证）
export function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, JWT_SECRET);
      req.admin = {
        id: decoded.id,
        username: decoded.username
      };
    }
  } catch (error) {
    // 验证失败但不阻止请求
  }
  next();
}

// 检查是否已安装
export async function checkInstalled(req, res, next) {
  // 允许安装相关的路由通过
  if (req.path.startsWith('/api/setup') || req.path === '/api/meta') {
    return next();
  }
  
  // 其他路由需要检查是否已安装
  const { isInstalled } = await import('../db/init.js');
  if (!isInstalled()) {
    return res.status(503).json({ error: '系统未安装，请先完成安装' });
  }
  next();
}

