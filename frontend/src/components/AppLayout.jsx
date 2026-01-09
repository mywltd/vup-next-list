import React, { createContext, useContext, useState, useEffect } from 'react';
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
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Brightness4,
  Brightness7,
  LiveTv,
  AdminPanelSettings,
  Search,
  Person,
  MusicNote,
} from '@mui/icons-material';
import ThemeCustomizer from './ThemeCustomizer';
import { authAPI } from '../services/api';

// 创建搜索上下文
const SearchContext = createContext();

export const useSearch = () => useContext(SearchContext);

function AppLayout({ siteConfig, mode, onToggleTheme, userThemeConfig, onUpdateUserTheme, isAdmin = false }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // < 768px
  const isDesktop = useMediaQuery(theme.breakpoints.up('md')); // >= 960px
  const [searchText, setSearchText] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 检查登录状态
  useEffect(() => {
    if (!isAdmin) {
      checkAuthStatus();
    }
  }, [isAdmin]);

  const checkAuthStatus = async () => {
    try {
      // 先检查localStorage中的token
      const token = localStorage.getItem('authToken');
      if (token) {
        // 验证token是否有效
        const status = await authAPI.getStatus();
        setIsAuthenticated(status.authenticated);
        if (!status.authenticated) {
          localStorage.removeItem('authToken');
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      setIsAuthenticated(false);
      localStorage.removeItem('authToken');
    }
  };

  const handleBilibiliClick = () => {
    if (siteConfig?.streamer?.bilibiliUrl) {
      window.open(siteConfig.streamer.bilibiliUrl, '_blank');
    }
  };

  return (
    <SearchContext.Provider value={{ searchText, setSearchText }}>
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AppBar 
          position="fixed" 
          elevation={0}
          color="default"
          sx={{
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            backgroundColor: mode === 'dark'
              ? 'rgba(20, 25, 45, 0.7)'
              : 'rgba(255, 255, 255, 0.7)',
            borderBottom: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            zIndex: 1100,
          }}
        >
          <Toolbar sx={{ gap: 2 }}>
            {/* 站点名称/Logo */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                cursor: 'pointer',
                flexShrink: 0,
              }}
              onClick={() => navigate('/')}
            >
              <MusicNote sx={{ color: 'primary.main', fontSize: 28 }} />
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontWeight: 600,
                  color: 'primary.main',
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                {siteConfig?.siteName || 'VUP 音乐歌单'}
              </Typography>
            </Box>

            {/* PC端搜索框 - 居中 */}
            {isDesktop && !isAdmin && (
              <Box sx={{ 
                position: 'absolute', 
                left: '50%', 
                transform: 'translateX(-50%)',
                width: '100%',
                maxWidth: 600,
              }}>
                <TextField
                  fullWidth
                  placeholder="搜索歌曲或歌手..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(10px)',
                      '&:hover': {
                        backgroundColor: mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.15)'
                          : 'rgba(255, 255, 255, 0.95)',
                      },
                      '&.Mui-focused': {
                        backgroundColor: mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.15)'
                          : 'rgba(255, 255, 255, 0.95)',
                      },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            )}

            {/* 右侧操作按钮组 */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0, ml: 'auto' }}>
              {/* 主播直播间图标（PC和移动端都只显示图标） */}
              {siteConfig?.streamer && !isAdmin && (
                <Tooltip title={`${siteConfig.streamer.name}的直播间`}>
                  <IconButton
                    onClick={handleBilibiliClick}
                    sx={{
                      color: mode === 'light' ? 'primary.main' : 'inherit',
                    }}
                  >
                    <LiveTv />
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
              <Tooltip title={mode === 'light' ? '切换到深色模式' : '切换到浅色模式'}>
                <IconButton 
                  onClick={onToggleTheme}
                  sx={{
                    color: mode === 'light' ? 'primary.main' : 'inherit',
                  }}
                >
                  {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
                </IconButton>
              </Tooltip>

              {/* 登录/管理按钮 - 放到最右边 */}
              {!isAdmin && (
                isAuthenticated ? (
                  <Tooltip title="管理后台">
                    <IconButton
                      onClick={() => navigate('/admin')}
                      sx={{
                        color: mode === 'light' ? 'primary.main' : 'inherit',
                      }}
                    >
                      <AdminPanelSettings />
                    </IconButton>
                  </Tooltip>
                ) : (
                  isMobile ? (
                    <Tooltip title="登录">
                      <IconButton
                        onClick={() => navigate('/admin/login')}
                        sx={{
                          color: mode === 'light' ? 'primary.main' : 'inherit',
                        }}
                      >
                        <Person />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip title="登录">
                      <Button
                        variant="outlined"
                        startIcon={<Person />}
                        onClick={() => navigate('/admin/login')}
                        sx={{
                          borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
                          color: mode === 'dark' ? 'inherit' : 'inherit',
                          '&:hover': {
                            borderColor: 'primary.main',
                            backgroundColor: mode === 'dark' 
                              ? 'rgba(255, 255, 255, 0.05)' 
                              : 'rgba(0, 0, 0, 0.04)',
                          },
                        }}
                      >
                        登录
                      </Button>
                    </Tooltip>
                  )
                )
              )}
            </Box>
          </Toolbar>
        </AppBar>
        
        {/* 为固定导航栏添加占位空间 */}
        <Toolbar />

      {/* 主内容区域 */}
      <Box component="main" sx={{ flexGrow: 1, py: 4, position: 'relative', zIndex: 1 }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
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
          borderTop: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          © 2026 {siteConfig?.siteName || 'VUP 音乐歌单'} • 
          Powered by FallSakura
        </Typography>
      </Box>
      </Box>
    </SearchContext.Provider>
  );
}

export default AppLayout;

