import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  useTheme,
} from '@mui/material';
import { Visibility, VisibilityOff, AdminPanelSettings } from '@mui/icons-material';
import { authAPI, siteAPI } from '../services/api';

function LoginPage({ mode = 'light' }) {
  const theme = useTheme();
  const isDark = mode === 'dark' || theme.palette.mode === 'dark';
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [siteConfig, setSiteConfig] = useState(null);

  // 加载站点配置
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await siteAPI.getMeta();
        setSiteConfig(config);
      } catch (error) {
        console.error('加载站点配置失败:', error);
      }
    };
    loadConfig();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('请输入用户名和密码');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await authAPI.login(username, password);
      
      // 保存JWT token到localStorage
      if (result.token) {
        localStorage.setItem('authToken', result.token);
        navigate('/admin');
      } else {
        setError('登录失败，请重试');
      }
    } catch (err) {
      setError(err.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
        position: 'relative',
        // 背景图片
        ...(siteConfig?.backgroundUrl && {
          backgroundImage: `url(${siteConfig.backgroundUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          backgroundRepeat: 'no-repeat',
          '&::before': {
            content: '""',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            backgroundColor: isDark 
              ? 'rgba(13, 15, 28, 0.7)' 
              : 'rgba(245, 247, 255, 0.8)',
            zIndex: 0,
            pointerEvents: 'none',
          },
        }),
        // 默认渐变背景（无背景图时）
        ...(!siteConfig?.backgroundUrl && {
          background: isDark
            ? 'linear-gradient(135deg, #0D0F1C 0%, #1A1F3D 100%)'
            : 'linear-gradient(180deg, #f2f3f5 0%, #ffffff 100%)',
          backgroundAttachment: 'fixed',
        }),
      }}
    >
      <Card
        sx={{
          maxWidth: 400,
          width: '100%',
          position: 'relative',
          zIndex: 1,
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          backgroundColor: isDark
            ? 'rgba(20, 25, 45, 0.8)'
            : 'rgba(255, 255, 255, 0.8)',
          border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          borderRadius: 2,
          boxShadow: isDark
            ? '0 8px 32px rgba(0, 0, 0, 0.3)'
            : '0 8px 32px rgba(0, 0, 0, 0.1)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <AdminPanelSettings sx={{ fontSize: 60, color: 'primary.main' }} />
            <Typography 
              variant="h5" 
              component="h1" 
              fontWeight={700} 
              sx={{ 
                mt: 2,
                color: isDark ? 'text.primary' : 'inherit',
              }}
            >
              管理员登录
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              margin="normal"
              autoComplete="username"
              autoFocus
              sx={{
                '& .MuiInputBase-root': {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                  color: isDark ? 'text.primary' : 'inherit',
                },
                '& .MuiInputLabel-root': {
                  color: isDark ? 'text.secondary' : 'inherit',
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: 'primary.main',
                },
              }}
            />
            <TextField
              fullWidth
              label="密码"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              autoComplete="current-password"
              sx={{
                '& .MuiInputBase-root': {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                  color: isDark ? 'text.primary' : 'inherit',
                },
                '& .MuiInputLabel-root': {
                  color: isDark ? 'text.secondary' : 'inherit',
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: 'primary.main',
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{
                        color: isDark ? 'text.secondary' : 'inherit',
                      }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              fullWidth
              variant="contained"
              type="submit"
              disabled={loading}
              sx={{ mt: 3, py: 1.5 }}
            >
              {loading ? '登录中...' : '登录'}
            </Button>

            <Button
              fullWidth
              variant="text"
              onClick={() => navigate('/')}
              sx={{ 
                mt: 2,
                color: isDark ? 'text.secondary' : 'inherit',
                '&:hover': {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              返回首页
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}

export default LoginPage;

