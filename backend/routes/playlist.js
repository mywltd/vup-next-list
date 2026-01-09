import express from 'express';
import { PlaylistService } from '../services/playlistService.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// 获取歌单列表（公开访问）
router.get('/', (req, res) => {
  try {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 50,
      firstLetter: req.query.firstLetter || null,
      language: req.query.language || null,
      special: req.query.special === 'true' ? true : req.query.special === 'false' ? false : null,
      search: req.query.search || ''
    };

    const result = PlaylistService.getPlaylist(options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取语种列表
router.get('/languages', (req, res) => {
  try {
    const languages = PlaylistService.getLanguages();
    res.json({ languages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取首字母列表
router.get('/first-letters', (req, res) => {
  try {
    const firstLetters = PlaylistService.getFirstLetters();
    res.json({ firstLetters });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取所有标签云数据
router.get('/tag-cloud', (req, res) => {
  try {
    const tagCloud = PlaylistService.getTagCloud();
    res.json(tagCloud);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 添加歌曲（需要认证）
router.post('/add', requireAuth, (req, res) => {
  try {
    const song = PlaylistService.addSong(req.body);
    res.json({ success: true, song });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 更新歌曲（需要认证）
router.put('/edit/:id', requireAuth, (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const song = PlaylistService.updateSong(id, req.body);
    res.json({ success: true, song });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 删除歌曲（需要认证）
router.delete('/delete/:id', requireAuth, (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = PlaylistService.deleteSong(id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 导入歌单（需要认证）
router.post('/import', requireAuth, (req, res) => {
  try {
    const { songs, clearExisting } = req.body;

    if (!Array.isArray(songs)) {
      return res.status(400).json({ error: '无效的歌单数据' });
    }

    // 如果需要清空现有歌单
    if (clearExisting) {
      PlaylistService.clearPlaylist();
    }

    const result = PlaylistService.importPlaylist(songs);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 导出歌单（需要认证）
router.get('/export', requireAuth, (req, res) => {
  try {
    const songs = PlaylistService.exportPlaylist();
    res.json({ songs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 清空歌单（需要认证）
router.delete('/clear', requireAuth, (req, res) => {
  try {
    const result = PlaylistService.clearPlaylist();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

