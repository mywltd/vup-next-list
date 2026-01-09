import express from 'express';
import jwt from 'jsonwebtoken';
import { AuthService } from '../services/authService.js';
import { requireAuth, verifyToken } from '../middleware/auth.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'vup-music-jwt-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'; // 默认7天过期

// 管理员登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }

    const admin = await AuthService.login(username, password);

    // 生成JWT token
    const token = jwt.sign(
      {
        id: admin.id,
        username: admin.username
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN
      }
    );

    res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        username: admin.username
      }
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// 退出登录（JWT是无状态的，这里只是返回成功，前端删除token即可）
router.post('/logout', (req, res) => {
  res.json({ success: true, message: '退出成功' });
});

// 检查登录状态
router.get('/status', verifyToken, (req, res) => {
  if (req.admin) {
    res.json({
      authenticated: true,
      admin: {
        id: req.admin.id,
        username: req.admin.username
      }
    });
  } else {
    res.json({ authenticated: false });
  }
});

// 修改密码
router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: '原密码和新密码不能为空' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: '新密码长度不能少于6位' });
    }

    const result = await AuthService.changePassword(
      req.admin.id,
      oldPassword,
      newPassword
    );

    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

