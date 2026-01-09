import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
  Typography,
  Alert,
} from '@mui/material';
import {
  Settings,
  MusicNote,
  LiveTv,
  Logout,
  Upload,
  Download,
  Code,
  AccountCircle,
} from '@mui/icons-material';
import { authAPI } from '../services/api';
import SiteConfigPanel from '../components/admin/SiteConfigPanel';
import PlaylistManagePanel from '../components/admin/PlaylistManagePanel';
import StreamerPanel from '../components/admin/StreamerPanel';
import ImportExportPanel from '../components/admin/ImportExportPanel';
import CustomConfigPanel from '../components/admin/CustomConfigPanel';
import AccountSettingsPanel from '../components/admin/AccountSettingsPanel';

function AdminPage({ onConfigUpdate }) {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // 检查localStorage中的token
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }
      
      // 验证token是否有效
      const { authenticated: isAuth } = await authAPI.getStatus();
      if (!isAuth) {
        localStorage.removeItem('authToken');
        navigate('/admin/login');
      } else {
        setAuthenticated(true);
      }
    } catch (error) {
      localStorage.removeItem('authToken');
      navigate('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      localStorage.removeItem('authToken');
      navigate('/admin/login');
    } catch (error) {
      console.error('退出失败:', error);
    }
  };


  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <Typography>加载中...</Typography>
      </Box>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <Box>
      {/* 页面标题 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>
          管理后台
        </Typography>
        <Button
          variant="outlined"
          color="error"
          startIcon={<Logout />}
          onClick={handleLogout}
        >
          退出登录
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        欢迎回来！你可以在这里管理站点配置、歌单和主播信息。
      </Alert>

      {/* 标签页 */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<Settings />} label="站点配置" />
          <Tab icon={<MusicNote />} label="歌单管理" />
          <Tab icon={<LiveTv />} label="主播信息" />
          <Tab icon={<Upload />} label="导入导出" />
          <Tab icon={<Code />} label="自定义配置" />
          <Tab icon={<AccountCircle />} label="账户设置" />
        </Tabs>
      </Card>

      {/* 标签页内容 */}
      <Card>
        <CardContent>
          {currentTab === 0 && <SiteConfigPanel onUpdate={onConfigUpdate} />}
          {currentTab === 1 && <PlaylistManagePanel />}
          {currentTab === 2 && <StreamerPanel onUpdate={onConfigUpdate} />}
          {currentTab === 3 && <ImportExportPanel />}
          {currentTab === 4 && <CustomConfigPanel />}
          {currentTab === 5 && <AccountSettingsPanel />}
        </CardContent>
      </Card>
    </Box>
  );
}

export default AdminPage;

