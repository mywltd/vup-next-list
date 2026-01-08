// 认证中间件
export function requireAuth(req, res, next) {
  if (!req.session || !req.session.adminId) {
    return res.status(401).json({ error: '未授权，请先登录' });
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

