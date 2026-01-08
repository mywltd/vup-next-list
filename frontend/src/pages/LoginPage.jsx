import React, { useState } from 'react';
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
import { authAPI } from '../services/api';

function LoginPage({ mode = 'light' }) {
  const theme = useTheme();
  const isDark = mode === 'dark' || theme.palette.mode === 'dark';
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      // 登录成功后，等待一下确保session设置完成，然后验证登录状态
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 验证登录状态
      const status = await authAPI.getStatus();
      if (status.authenticated) {
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
        background: isDark
          ? 'linear-gradient(135deg, #0D0F1C 0%, #1A1F3D 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 400,
          width: '100%',
          backdropFilter: 'blur(20px) saturate(180%)',
          backgroundColor: isDark
            ? 'rgba(20, 25, 45, 0.95)'
            : 'rgba(255, 255, 255, 0.95)',
          border: isDark
            ? '1px solid rgba(255, 255, 255, 0.1)'
            : 'none',
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

