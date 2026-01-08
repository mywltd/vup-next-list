import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Box,
  Container,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Brightness4,
  Brightness7,
  LiveTv,
  AdminPanelSettings,
} from '@mui/icons-material';
import ThemeCustomizer from './ThemeCustomizer';

function AppLayout({ siteConfig, mode, onToggleTheme, userThemeConfig, onUpdateUserTheme, isAdmin = false }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // < 768px

  const handleBilibiliClick = () => {
    if (siteConfig?.streamer?.bilibiliUrl) {
      window.open(siteConfig.streamer.bilibiliUrl, '_blank');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar 
        position="sticky" 
        elevation={0}
        color="default"
        sx={{
          backdropFilter: 'blur(20px) saturate(180%)',
          backgroundColor: mode === 'dark'
            ? 'rgba(20, 25, 45, 0.85)'
            : 'rgba(255, 255, 255, 0.85)',
          boxShadow: mode === 'dark'
            ? '0 4px 30px rgba(0, 0, 0, 0.5)'
            : '0 4px 30px rgba(123, 104, 238, 0.1)',
        }}
      >
        <Toolbar>
          {/* 站点名称 */}
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #FF6B9D 0%, #7B68EE 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/')}
          >
            {siteConfig?.siteName || 'VUP 音乐歌单'}
          </Typography>

          {/* 主播直播间按钮/图标 */}
          {siteConfig?.streamer && !isAdmin && (
            <>
              {isMobile ? (
                // 移动端：只显示图标
                <Tooltip title={`${siteConfig.streamer.name}的直播间`}>
                  <IconButton
                    onClick={handleBilibiliClick}
                    sx={{
                      mr: 1,
                      color: mode === 'light' ? 'primary.main' : 'inherit',
                    }}
                  >
                    <LiveTv />
                  </IconButton>
                </Tooltip>
              ) : (
                // PC端：显示完整按钮
                <Tooltip title={`${siteConfig.streamer.name}的直播间`}>
                  <Button
                    color="inherit"
                    startIcon={<LiveTv />}
                    onClick={handleBilibiliClick}
                    sx={{
                      mr: 2,
                      background: 'linear-gradient(135deg, #FF6B9D 0%, #7B68EE 100%)',
                      color: 'white',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #FF4A7C 0%, #6956E0 100%)',
                      },
                    }}
                  >
                    {siteConfig.streamer.name}的直播间
                  </Button>
                </Tooltip>
              )}
            </>
          )}

          {/* 管理后台按钮 */}
          {!isAdmin && (
            <Tooltip title="管理后台">
              <IconButton
                onClick={() => navigate('/admin/login')}
                sx={{ 
                  mr: 1,
                  color: mode === 'light' ? 'primary.main' : 'inherit',
                }}
              >
                <AdminPanelSettings />
              </IconButton>
            </Tooltip>
          )}

          {/* 主题配色自定义 */}
          <ThemeCustomizer
            userThemeConfig={userThemeConfig}
            onUpdateUserTheme={onUpdateUserTheme}
            mode={mode}
          />

          {/* 日夜模式切换 */}
          <Tooltip title={mode === 'light' ? '切换到暗色模式' : '切换到亮色模式'}>
            <IconButton 
              onClick={onToggleTheme}
              sx={{
                color: mode === 'light' ? 'primary.main' : 'inherit',
              }}
            >
              {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* 主内容区域 */}
      <Box component="main" sx={{ flexGrow: 1, py: 4 }}>
        <Container maxWidth="xl">
          <Outlet />
        </Container>
      </Box>

      {/* 页脚 */}
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          textAlign: 'center',
          backdropFilter: 'blur(10px)',
          backgroundColor: mode === 'dark'
            ? 'rgba(20, 25, 45, 0.5)'
            : 'rgba(255, 255, 255, 0.5)',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          © 2026 {siteConfig?.siteName || 'VUP 音乐歌单'} • 
          Powered by FallSakura All Rights Reserved.
        </Typography>
      </Box>
    </Box>
  );
}

export default AppLayout;

