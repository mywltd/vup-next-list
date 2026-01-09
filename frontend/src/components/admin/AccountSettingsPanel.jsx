import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Divider,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  DeleteSweep,
  Lock,
} from '@mui/icons-material';
import { authAPI } from '../../services/api';
import { clearImageCache, getCacheSize } from '../../utils/imageCache';

function AccountSettingsPanel() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // 验证输入
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('请填写所有字段');
      return;
    }

    if (newPassword.length < 6) {
      setError('新密码长度不能少于6位');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('两次输入的新密码不一致');
      return;
    }

    if (oldPassword === newPassword) {
      setError('新密码不能与原密码相同');
      return;
    }

    setLoading(true);

    try {
      await authAPI.changePassword(oldPassword, newPassword);
      setSuccess('密码修改成功！');
      // 清空表单
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || '密码修改失败');
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = () => {
    const sizeBefore = getCacheSize();
    clearImageCache();
    const sizeAfter = getCacheSize();
    alert(`缓存已清除！\n清除前缓存大小：${(sizeBefore / 1024).toFixed(2)} KB\n清除后缓存大小：${(sizeAfter / 1024).toFixed(2)} KB`);
    window.location.reload();
  };

  return (
    <Box>
      {/* 修改密码部分 */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Lock sx={{ fontSize: 24, color: 'primary.main' }} />
          <Typography variant="h6" fontWeight={600}>
            修改密码
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleChangePassword}>
          <TextField
            fullWidth
            label="原密码"
            type={showOldPassword ? 'text' : 'password'}
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            margin="normal"
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    edge="end"
                  >
                    {showOldPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="新密码"
            type={showNewPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            margin="normal"
            required
            helperText="密码长度不能少于6位"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    edge="end"
                  >
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="确认新密码"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            margin="normal"
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ mt: 2 }}
            startIcon={loading ? <CircularProgress size={20} /> : <Lock />}
          >
            {loading ? '修改中...' : '修改密码'}
          </Button>
        </form>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* 清除缓存部分 */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <DeleteSweep sx={{ fontSize: 24, color: 'error.main' }} />
          <Typography variant="h6" fontWeight={600}>
            清除缓存
          </Typography>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          清除所有缓存的图片数据，包括背景图和头像。清除后需要重新加载页面。
        </Alert>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            当前缓存大小：{(getCacheSize() / 1024).toFixed(2)} KB
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="error"
          startIcon={<DeleteSweep />}
          onClick={handleClearCache}
          size="large"
        >
          清除所有缓存
        </Button>
      </Box>
    </Box>
  );
}

export default AccountSettingsPanel;

