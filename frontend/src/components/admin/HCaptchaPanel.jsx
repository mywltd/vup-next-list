import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Stack,
  Switch,
  FormControlLabel,
  CircularProgress,
  Paper,
  Divider,
} from '@mui/material';
import { Save, Security } from '@mui/icons-material';
import { siteAPI } from '../../services/api';

function HCaptchaPanel({ onUpdate }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [config, setConfig] = useState({
    hcaptchaEnabled: false,
    hcaptchaSiteKey: '',
    hcaptchaSecretKey: '',
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await siteAPI.getMeta();
      setConfig({
        hcaptchaEnabled: data.hcaptchaEnabled || false,
        hcaptchaSiteKey: data.hcaptchaSiteKey || '',
        hcaptchaSecretKey: '', // 出于安全考虑，不从服务器返回secret key
      });
    } catch (error) {
      setMessage({ type: 'error', text: '加载配置失败' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (event) => {
    const value = field === 'hcaptchaEnabled' ? event.target.checked : event.target.value;
    setConfig({
      ...config,
      [field]: value,
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      // 验证必填字段
      if (config.hcaptchaEnabled) {
        if (!config.hcaptchaSiteKey) {
          setMessage({ type: 'error', text: '请填写 hCaptcha Site Key' });
          setSaving(false);
          return;
        }
        if (!config.hcaptchaSecretKey) {
          setMessage({ type: 'error', text: '请填写 hCaptcha Secret Key' });
          setSaving(false);
          return;
        }
      }

      await siteAPI.updateConfig(config);
      setMessage({ type: 'success', text: 'hCaptcha配置保存成功' });
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || '保存失败' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight={600}>
        hCaptcha 验证码配置
      </Typography>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 3 }}>
          {message.text}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Security color="primary" />
          <Typography variant="subtitle1" fontWeight={600}>
            验证码设置
          </Typography>
        </Box>

        <FormControlLabel
          control={
            <Switch
              checked={config.hcaptchaEnabled}
              onChange={handleChange('hcaptchaEnabled')}
              color="primary"
            />
          }
          label={
            <Box>
              <Typography variant="body2" fontWeight={600}>
                启用 hCaptcha 验证码
              </Typography>
              <Typography variant="caption" color="text.secondary">
                开启后，管理员登录需要完成人机验证
              </Typography>
            </Box>
          }
          sx={{ mb: 3 }}
        />

        <Divider sx={{ mb: 3 }} />

        <Stack spacing={3}>
          <TextField
            fullWidth
            label="hCaptcha Site Key"
            value={config.hcaptchaSiteKey}
            onChange={handleChange('hcaptchaSiteKey')}
            disabled={!config.hcaptchaEnabled}
            required={config.hcaptchaEnabled}
            helperText="从 hCaptcha 控制台获取的站点密钥（公开）"
            placeholder="10000000-ffff-ffff-ffff-000000000001"
          />

          <TextField
            fullWidth
            label="hCaptcha Secret Key"
            value={config.hcaptchaSecretKey}
            onChange={handleChange('hcaptchaSecretKey')}
            disabled={!config.hcaptchaEnabled}
            required={config.hcaptchaEnabled}
            type="password"
            helperText="从 hCaptcha 控制台获取的服务端密钥（保密）"
            placeholder="0x0000000000000000000000000000000000000000"
          />
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          📝 配置步骤
        </Typography>
        <Box component="ol" sx={{ pl: 2, '& li': { mb: 1 } }}>
          <li>
            <Typography variant="body2">
              访问 <a href="https://www.hcaptcha.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#6EC1E4' }}>hCaptcha 官网</a> 注册账号
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              在控制台创建新站点，获取 Site Key 和 Secret Key
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              将密钥填写到上方表单中
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              开启验证码开关，保存配置
            </Typography>
          </li>
        </Box>
      </Paper>

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
    </Box>
  );
}

export default HCaptchaPanel;

