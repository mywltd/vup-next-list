import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Stack,
  CircularProgress,
} from '@mui/material';
import { Save } from '@mui/icons-material';
import { siteAPI } from '../../services/api';

function StreamerPanel({ onUpdate }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [streamer, setStreamer] = useState({
    name: '',
    bilibiliUrl: '',
  });

  useEffect(() => {
    loadStreamer();
  }, []);

  const loadStreamer = async () => {
    try {
      const data = await siteAPI.getMeta();
      if (data.streamer) {
        setStreamer({
          name: data.streamer.name || '',
          bilibiliUrl: data.streamer.bilibiliUrl || '',
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '加载主播信息失败' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (event) => {
    setStreamer({
      ...streamer,
      [field]: event.target.value,
    });
  };

  const handleSave = async () => {
    if (!streamer.name.trim() || !streamer.bilibiliUrl.trim()) {
      setMessage({ type: 'error', text: '主播名称和直播间地址不能为空' });
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await siteAPI.updateStreamer(streamer);
      setMessage({ type: 'success', text: '主播信息保存成功' });
      if (onUpdate) onUpdate();
    } catch (error) {
      setMessage({ type: 'error', text: '保存失败: ' + error.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight={600}>
        主播信息
      </Typography>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 3 }}>
          {message.text}
        </Alert>
      )}

      <Stack spacing={3}>
        <TextField
          fullWidth
          label="主播名称"
          value={streamer.name}
          onChange={handleChange('name')}
          required
        />

        <TextField
          fullWidth
          label="Bilibili 直播间地址"
          value={streamer.bilibiliUrl}
          onChange={handleChange('bilibiliUrl')}
          required
          placeholder="https://live.bilibili.com/..."
        />

        <Box>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSave}
            disabled={saving}
            size="large"
          >
            {saving ? '保存中...' : '保存主播信息'}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}

export default StreamerPanel;

