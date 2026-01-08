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
import { Save, Code } from '@mui/icons-material';
import { siteAPI } from '../../services/api';

function CustomConfigPanel() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [config, setConfig] = useState({
    customCss: '',
    customJs: '',
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await siteAPI.getMeta();
      setConfig({
        customCss: data.customCss || '',
        customJs: data.customJs || '',
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

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      // 获取当前完整配置
      const currentConfig = await siteAPI.getMeta();
      await siteAPI.updateConfig({
        ...currentConfig,
        customCss: config.customCss,
        customJs: config.customJs,
      });
      setMessage({ type: 'success', text: '自定义配置保存成功，请刷新页面查看效果' });
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
        自定义配置
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        在这里可以添加自定义 CSS 和 JavaScript 代码，用于个性化定制网站样式和功能。
        保存后需要刷新页面才能看到效果。
      </Alert>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 3 }}>
          {message.text}
        </Alert>
      )}

      <Stack spacing={3}>
        <Box>
          <Typography variant="subtitle2" gutterBottom fontWeight={600}>
            自定义 CSS
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={12}
            value={config.customCss}
            onChange={handleChange('customCss')}
            placeholder="/* 在这里输入自定义 CSS 代码 */&#10;.my-custom-class {&#10;  color: red;&#10;}"
            sx={{
              '& .MuiInputBase-root': {
                fontFamily: 'monospace',
                fontSize: '0.875rem',
              },
            }}
            helperText="自定义 CSS 代码，将直接注入到页面 head 中"
          />
        </Box>

        <Box>
          <Typography variant="subtitle2" gutterBottom fontWeight={600}>
            自定义 JavaScript
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={12}
            value={config.customJs}
            onChange={handleChange('customJs')}
            placeholder="// 在这里输入自定义 JavaScript 代码&#10;console.log('Hello World');"
            sx={{
              '& .MuiInputBase-root': {
                fontFamily: 'monospace',
                fontSize: '0.875rem',
              },
            }}
            helperText="自定义 JavaScript 代码，将在页面加载后执行"
          />
        </Box>

        <Box>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSave}
            disabled={saving}
            size="large"
          >
            {saving ? '保存中...' : '保存配置'}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}

export default CustomConfigPanel;

