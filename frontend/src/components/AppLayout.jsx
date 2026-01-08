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
} from '@mui/material';
import {
  Brightness4,
  Brightness7,
  LiveTv,
  AdminPanelSettings,
} from '@mui/icons-material';

function AppLayout({ siteConfig, mode, onToggleTheme, isAdmin = false }) {
  const navigate = useNavigate();

  const handleBilibiliClick = () => {
    if (siteConfig?.streamer?.bilibiliUrl) {
      window.open(siteConfig.streamer.bilibiliUrl, '_blank');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="sticky" elevation={0}>
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

          {/* 主播直播间按钮 */}
          {siteConfig?.streamer && !isAdmin && (
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

          {/* 管理后台按钮 */}
          {!isAdmin && (
            <Tooltip title="管理后台">
              <IconButton
                color="inherit"
                onClick={() => navigate('/admin/login')}
                sx={{ mr: 1 }}
              >
                <AdminPanelSettings />
              </IconButton>
            </Tooltip>
          )}

          {/* 日夜模式切换 */}
          <Tooltip title={mode === 'light' ? '切换到暗色模式' : '切换到亮色模式'}>
            <IconButton onClick={onToggleTheme} color="inherit">
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
          由 ❤️ 和 🎵 驱动
        </Typography>
      </Box>
    </Box>
  );
}

export default AppLayout;

