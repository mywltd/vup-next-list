import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Stack,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import { Save, Upload } from '@mui/icons-material';
import { siteAPI } from '../../services/api';

function SiteConfigPanel({ onUpdate }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [config, setConfig] = useState({
    siteName: '',
    siteSubtitle: '',
    defaultPlaylistName: '',
    avatarUrl: '',
    backgroundUrl: '',
    themeConfig: {
      primaryColor: '#FF6B9D',
      secondaryColor: '#7B68EE',
    },
    seoKeywords: '',
    seoDescription: '',
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await siteAPI.getMeta();
      setConfig({
        siteName: data.siteName || '',
        siteSubtitle: data.siteSubtitle || '',
        defaultPlaylistName: data.defaultPlaylistName || '',
        avatarUrl: data.avatarUrl || '',
        backgroundUrl: data.backgroundUrl || '',
        themeConfig: data.themeConfig || {
          primaryColor: '#FF6B9D',
          secondaryColor: '#7B68EE',
        },
        seoKeywords: data.seoKeywords || '',
        seoDescription: data.seoDescription || '',
      });
    } catch (error) {
      setMessage({ type: 'error', text: '加载配置失败' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (event) => {
    setConfig({
      ...config,
      [field]: event.target.value,
    });
  };

  const handleThemeColorChange = (field) => (event) => {
    setConfig({
      ...config,
      themeConfig: {
        ...config.themeConfig,
        [field]: event.target.value,
      },
    });
  };

  const handleFileUpload = (field) => {
    return async (event) => {
      const file = event.target.files?.[0];
      if (!file) {
        // 重置input，允许重复上传同一文件
        event.target.value = '';
        return;
      }

      setUploading(true);
      setMessage({ type: '', text: '' });

      try {
        const response = await siteAPI.uploadFile(file);
        // 响应拦截器返回response.data，后端返回{success: true, url: '...'}
        const url = response?.url;
        
        if (!url) {
          console.error('上传响应:', response);
          throw new Error('服务器未返回文件URL');
        }

        // 将相对路径转换为完整URL
        const fullUrl = url.startsWith('http') 
          ? url 
          : `${window.location.origin}${url}`;
        
        setConfig({
          ...config,
          [field]: fullUrl,
        });
        setMessage({ type: 'success', text: '文件上传成功' });
      } catch (error) {
        console.error('文件上传错误:', error);
        const errorMessage = error.response?.data?.error || error.message || '文件上传失败';
        setMessage({ type: 'error', text: `文件上传失败: ${errorMessage}` });
      } finally {
        setUploading(false);
        // 重置input，允许重复上传同一文件
        event.target.value = '';
      }
    };
  };

  const handleSave = async () => {
    if (!config.siteName.trim()) {
      setMessage({ type: 'error', text: '站点名称不能为空' });
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await siteAPI.updateConfig(config);
      setMessage({ type: 'success', text: '配置保存成功' });
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
        站点配置
      </Typography>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 3 }}>
          {message.text}
        </Alert>
      )}

      <Stack spacing={3}>
        <TextField
          fullWidth
          label="站点名称"
          value={config.siteName}
          onChange={handleChange('siteName')}
          required
          helperText="将显示在浏览器标题栏"
        />

        <TextField
          fullWidth
          label="站点副标题"
          value={config.siteSubtitle}
          onChange={handleChange('siteSubtitle')}
          helperText="将显示在标题后，格式：站点名称 - 副标题"
        />

        <TextField
          fullWidth
          label="默认歌单名称"
          value={config.defaultPlaylistName}
          onChange={handleChange('defaultPlaylistName')}
        />

        <Box>
          <TextField
            fullWidth
            label="站点头像 URL"
            value={config.avatarUrl}
            onChange={handleChange('avatarUrl')}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    component="label"
                    startIcon={<Upload />}
                    disabled={uploading}
                  >
                    上传
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleFileUpload('avatarUrl')}
                    />
                  </Button>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Box>
          <TextField
            fullWidth
            label="背景图片 URL"
            value={config.backgroundUrl}
            onChange={handleChange('backgroundUrl')}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    component="label"
                    startIcon={<Upload />}
                    disabled={uploading}
                  >
                    上传
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleFileUpload('backgroundUrl')}
                    />
                  </Button>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Box>
          <Typography variant="subtitle2" gutterBottom fontWeight={600}>
            SEO 配置
          </Typography>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="SEO 关键词"
              value={config.seoKeywords}
              onChange={handleChange('seoKeywords')}
              helperText="多个关键词用逗号分隔"
              placeholder="音乐, 歌单, VUP"
            />
            <TextField
              fullWidth
              label="SEO 描述"
              value={config.seoDescription}
              onChange={handleChange('seoDescription')}
              multiline
              rows={3}
              helperText="网站描述，用于搜索引擎展示"
            />
          </Stack>
        </Box>

        <Box>
          <Typography variant="subtitle2" gutterBottom fontWeight={600}>
            主题配置
          </Typography>
          <Stack direction="row" spacing={2}>
            <TextField
              label="主色调"
              type="color"
              value={config.themeConfig.primaryColor}
              onChange={handleThemeColorChange('primaryColor')}
              sx={{ width: 200 }}
            />
            <TextField
              label="辅色调"
              type="color"
              value={config.themeConfig.secondaryColor}
              onChange={handleThemeColorChange('secondaryColor')}
              sx={{ width: 200 }}
            />
          </Stack>
        </Box>

        <Box>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSave}
            disabled={saving || uploading}
            size="large"
          >
            {saving ? '保存中...' : '保存配置'}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}

export default SiteConfigPanel;

