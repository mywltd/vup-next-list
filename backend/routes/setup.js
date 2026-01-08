import express from 'express';
import { SetupService } from '../services/setupService.js';
import { isInstalled } from '../db/init.js';

const router = express.Router();

// 检查安装状态
router.get('/status', (req, res) => {
  try {
    const installed = isInstalled();
    res.json({ installed });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 执行安装
router.post('/install', async (req, res) => {
  try {
    // 检查是否已安装
    if (isInstalled()) {
      return res.status(400).json({ error: '系统已安装' });
    }

    const result = await SetupService.install(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

