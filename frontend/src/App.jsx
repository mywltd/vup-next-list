import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { createAnimeTheme } from './theme/theme';
import { setupAPI, siteAPI } from './services/api';

// 页面组件
import SetupPage from './pages/SetupPage';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';

// 布局组件
import AppLayout from './components/AppLayout';

function App() {
  // 从 localStorage 读取主题模式和自定义配色
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('themeMode') || 'light';
  });
  const [userThemeConfig, setUserThemeConfig] = useState(() => {
    const saved = localStorage.getItem('userThemeConfig');
    return saved ? JSON.parse(saved) : null;
  });
  const [siteConfig, setSiteConfig] = useState(null);
  const [installed, setInstalled] = useState(null);
  const [loading, setLoading] = useState(true);

  // 创建主题（优先使用用户自定义配色）
  const theme = useMemo(() => {
    const customConfig = userThemeConfig || siteConfig?.themeConfig || {};
    return createAnimeTheme(mode, customConfig);
  }, [mode, siteConfig, userThemeConfig]);

  // 检查安装状态
  useEffect(() => {
    checkInstallStatus();
  }, []);

  const checkInstallStatus = async () => {
    try {
      const { installed: isInstalled } = await setupAPI.getStatus();
      setInstalled(isInstalled);
      
      if (isInstalled) {
        loadSiteConfig();
      }
    } catch (error) {
      console.error('检查安装状态失败:', error);
      // 如果请求失败，假设未安装
      setInstalled(false);
    } finally {
      setLoading(false);
    }
  };

  const loadSiteConfig = async () => {
    try {
      const config = await siteAPI.getMeta();
      setSiteConfig(config);
      
      // 更新网页标题
      if (config) {
        const title = config.siteSubtitle 
          ? `${config.siteName} - ${config.siteSubtitle}`
          : config.siteName || 'VUP 音乐歌单';
        document.title = title;
        
        // 更新SEO meta标签
        if (config.seoDescription) {
          let metaDesc = document.querySelector('meta[name="description"]');
          if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.setAttribute('name', 'description');
            document.head.appendChild(metaDesc);
          }
          metaDesc.setAttribute('content', config.seoDescription);
        }
        
        if (config.seoKeywords) {
          let metaKeywords = document.querySelector('meta[name="keywords"]');
          if (!metaKeywords) {
            metaKeywords = document.createElement('meta');
            metaKeywords.setAttribute('name', 'keywords');
            document.head.appendChild(metaKeywords);
          }
          metaKeywords.setAttribute('content', config.seoKeywords);
        }
        
        // 注入自定义CSS
        if (config.customCss) {
          let styleEl = document.getElementById('custom-site-css');
          if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = 'custom-site-css';
            document.head.appendChild(styleEl);
          }
          styleEl.textContent = config.customCss;
        }
        
        // 注入自定义JS
        if (config.customJs) {
          let scriptEl = document.getElementById('custom-site-js');
          if (scriptEl) {
            scriptEl.remove();
          }
          scriptEl = document.createElement('script');
          scriptEl.id = 'custom-site-js';
          scriptEl.textContent = config.customJs;
          document.body.appendChild(scriptEl);
        }
      }
    } catch (error) {
      console.error('加载站点配置失败:', error);
    }
  };

  const toggleTheme = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', newMode);
      return newMode;
    });
  };

  const updateUserTheme = (config) => {
    setUserThemeConfig(config);
    localStorage.setItem('userThemeConfig', JSON.stringify(config));
  };

  const handleInstallComplete = () => {
    setInstalled(true);
    loadSiteConfig();
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          <Box sx={{ textAlign: 'center', color: 'white' }}>
            <h1>🎵 加载中...</h1>
          </Box>
        </Box>
      </ThemeProvider>
    );
  }

  // 如果未安装，跳转到安装页面
  if (installed === false) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          <Route path="/setup" element={<SetupPage onComplete={handleInstallComplete} />} />
          <Route path="*" element={<Navigate to="/setup" replace />} />
        </Routes>
      </ThemeProvider>
    );
  }

  // 已安装，显示正常路由
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
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
              backgroundColor: mode === 'dark' 
                ? 'rgba(13, 15, 28, 0.7)' 
                : 'rgba(245, 247, 255, 0.8)',
              zIndex: 0,
              pointerEvents: 'none',
            },
          }),
          // 默认渐变背景（无背景图时）
          ...(!siteConfig?.backgroundUrl && {
            background: mode === 'dark'
              ? 'linear-gradient(135deg, #0D0F1C 0%, #1A1F3D 100%)'
              : 'linear-gradient(135deg, #F5F7FF 0%, #E8ECFF 100%)',
            backgroundAttachment: 'fixed',
          }),
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Routes>
            <Route
              path="/"
              element={
                <AppLayout
                  siteConfig={siteConfig}
                  mode={mode}
                  onToggleTheme={toggleTheme}
                  userThemeConfig={userThemeConfig}
                  onUpdateUserTheme={updateUserTheme}
                />
              }
            >
              <Route index element={<HomePage siteConfig={siteConfig} />} />
            </Route>
          <Route 
            path="/admin/login" 
            element={
              <LoginPage mode={mode} />
            } 
          />
          <Route
            path="/admin"
            element={
              <AppLayout
                siteConfig={siteConfig}
                mode={mode}
                onToggleTheme={toggleTheme}
                userThemeConfig={userThemeConfig}
                onUpdateUserTheme={updateUserTheme}
                isAdmin
              />
            }
          >
            <Route index element={<AdminPage onConfigUpdate={loadSiteConfig} />} />
          </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;

