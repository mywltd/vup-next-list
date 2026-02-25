import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { setupAPI } from '../services/api';

const steps = ['站点信息', '管理员账号', '主播信息'];

function SetupPage({ onComplete }) {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    siteName: '',
    defaultPlaylistName: '歌单',
    avatarUrl: '',
    backgroundUrl: '',
    adminUsername: '',
    adminPassword: '',
    confirmPassword: '',
    streamerName: '',
    bilibiliUrl: '',
    themeConfig: {
      primaryColor: '#FF6B9D',
      secondaryColor: '#7B68EE',
    },
  });

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
    setError('');
  };

  const validateStep = () => {
    switch (activeStep) {
      case 0:
        if (!formData.siteName.trim()) {
          setError('请输入站点名称');
          return false;
        }
        break;
      case 1:
        if (!formData.adminUsername.trim()) {
          setError('请输入管理员用户名');
          return false;
        }
        if (formData.adminPassword.length < 6) {
          setError('密码长度不能少于6位');
          return false;
        }
        if (formData.adminPassword !== formData.confirmPassword) {
          setError('两次输入的密码不一致');
          return false;
        }
        break;
      case 2:
        if (!formData.streamerName.trim()) {
          setError('请输入主播名称');
          return false;
        }
        if (!formData.bilibiliUrl.trim()) {
          setError('请输入 Bilibili 直播间地址');
          return false;
        }
        break;
      default:
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) {
      return;
    }

    if (activeStep === steps.length - 1) {
      handleInstall();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setError('');
  };

  const handleInstall = async () => {
    setLoading(true);
    setError('');

    try {
      await setupAPI.install(formData);
      onComplete();
    } catch (err) {
      setError(err.message || '安装失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <>
            <TextField
              fullWidth
              label="站点名称"
              value={formData.siteName}
              onChange={handleChange('siteName')}
              margin="normal"
              required
              placeholder="例如：小雨的歌单"
            />
            <TextField
              fullWidth
              label="默认歌单名称"
              value={formData.defaultPlaylistName}
              onChange={handleChange('defaultPlaylistName')}
              margin="normal"
              placeholder="例如：我的歌单"
            />
            <TextField
              fullWidth
              label="站点头像 URL（可选）"
              value={formData.avatarUrl}
              onChange={handleChange('avatarUrl')}
              margin="normal"
              placeholder="https://..."
            />
            <TextField
              fullWidth
              label="背景图片 URL（可选）"
              value={formData.backgroundUrl}
              onChange={handleChange('backgroundUrl')}
              margin="normal"
              placeholder="https://..."
            />
          </>
        );
      case 1:
        return (
          <>
            <TextField
              fullWidth
              label="管理员用户名"
              value={formData.adminUsername}
              onChange={handleChange('adminUsername')}
              margin="normal"
              required
              autoComplete="username"
            />
            <TextField
              fullWidth
              label="管理员密码"
              type={showPassword ? 'text' : 'password'}
              value={formData.adminPassword}
              onChange={handleChange('adminPassword')}
              margin="normal"
              required
              autoComplete="new-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="确认密码"
              type={showPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange('confirmPassword')}
              margin="normal"
              required
              autoComplete="new-password"
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              密码长度不能少于6位
            </Typography>
          </>
        );
      case 2:
        return (
          <>
            <TextField
              fullWidth
              label="主播名称"
              value={formData.streamerName}
              onChange={handleChange('streamerName')}
              margin="normal"
              required
              placeholder="例如：小雨"
            />
            <TextField
              fullWidth
              label="Bilibili 直播间地址"
              value={formData.bilibiliUrl}
              onChange={handleChange('bilibiliUrl')}
              margin="normal"
              required
              placeholder="https://live.bilibili.com/..."
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 600,
          width: '100%',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" fontWeight={700}>
            🎵 欢迎使用 VUP 歌单系统
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 4 }}>
            首次使用需要完成初始化配置
          </Typography>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {renderStepContent()}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0 || loading}
              onClick={handleBack}
            >
              上一步
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} />}
            >
              {activeStep === steps.length - 1 ? '完成安装' : '下一步'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default SetupPage;

