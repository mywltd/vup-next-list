import express from 'express';
import { AuthService } from '../services/authService.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// 管理员登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }

    const admin = await AuthService.login(username, password);

    // 设置 session
    req.session.adminId = admin.id;
    req.session.username = admin.username;

    res.json({
      success: true,
      admin: {
        id: admin.id,
        username: admin.username
      }
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// 退出登录
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: '退出失败' });
    }
    res.json({ success: true, message: '退出成功' });
  });
});

// 检查登录状态
router.get('/status', (req, res) => {
  if (req.session && req.session.adminId) {
    res.json({
      authenticated: true,
      admin: {
        id: req.session.adminId,
        username: req.session.username
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
      req.session.adminId,
      oldPassword,
      newPassword
    );

    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

