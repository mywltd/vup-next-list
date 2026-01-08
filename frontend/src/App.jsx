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
          background: mode === 'dark'
            ? 'linear-gradient(135deg, #0D0F1C 0%, #1A1F3D 100%)'
            : 'linear-gradient(135deg, #F5F7FF 0%, #E8ECFF 100%)',
          backgroundAttachment: 'fixed',
        }}
      >
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
          <Route path="/admin/login" element={<LoginPage />} />
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
    </ThemeProvider>
  );
}

export default App;

