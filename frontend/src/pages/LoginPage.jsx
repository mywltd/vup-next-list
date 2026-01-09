import React, { useState, useEffect, useRef } from 'react';
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
import HCaptcha from '@hcaptcha/react-hcaptcha';
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
  const [hcaptchaConfig, setHcaptchaConfig] = useState({ enabled: false, siteKey: null });
  const [hcaptchaToken, setHcaptchaToken] = useState(null);
  const hcaptchaRef = useRef(null);

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

  // 加载 hCaptcha 配置
  useEffect(() => {
    const loadHCaptchaConfig = async () => {
      try {
        const config = await authAPI.getHCaptchaConfig();
        setHcaptchaConfig(config);
      } catch (error) {
        console.error('加载 hCaptcha 配置失败:', error);
      }
    };
    loadHCaptchaConfig();
  }, []);

  // hCaptcha 验证成功回调
  const handleHCaptchaVerify = (token) => {
    setHcaptchaToken(token);
    setError(''); // 清除之前的错误
  };

  // hCaptcha 过期回调
  const handleHCaptchaExpire = () => {
    setHcaptchaToken(null);
  };

  // hCaptcha 错误回调
  const handleHCaptchaError = (err) => {
    console.error('hCaptcha错误:', err);
    setHcaptchaToken(null);
    setError('验证码加载失败，请刷新页面重试');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('请输入用户名和密码');
      return;
    }

    // 如果启用了 hCaptcha 但没有验证
    if (hcaptchaConfig.enabled && !hcaptchaToken) {
      setError('请完成人机验证');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await authAPI.login(username, password, hcaptchaToken);
      
      // 保存JWT token到localStorage
      if (result.token) {
        localStorage.setItem('authToken', result.token);
        navigate('/admin');
      } else {
        setError('登录失败，请重试');
      }
    } catch (err) {
      setError(err.message || '登录失败');
      // 重置 hCaptcha
      if (hcaptchaRef.current) {
        hcaptchaRef.current.resetCaptcha();
        setHcaptchaToken(null);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 140px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
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

            {/* hCaptcha 验证码 */}
            {hcaptchaConfig.enabled && hcaptchaConfig.siteKey && (
              <Box 
                sx={{ 
                  mt: 2,
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <HCaptcha
                  sitekey={hcaptchaConfig.siteKey}
                  onVerify={handleHCaptchaVerify}
                  onExpire={handleHCaptchaExpire}
                  onError={handleHCaptchaError}
                  ref={hcaptchaRef}
                />
              </Box>
            )}

            <Button
              fullWidth
              variant="contained"
              type="submit"
              disabled={loading || (hcaptchaConfig.enabled && !hcaptchaToken)}
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

