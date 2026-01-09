import React, { useState } from 'react';
import {
  IconButton,
  Popover,
  Box,
  Typography,
  Button,
  Stack,
  Tooltip,
} from '@mui/material';
import { Palette, Refresh } from '@mui/icons-material';

// 轻动漫风格配色预设（与后台配置保持一致）
const PRESET_THEMES = [
  { name: '樱花粉', primary: '#FFB3D9', secondary: '#B8E6FF', description: '柔和的粉蓝配色，清新可爱' },
  { name: '薄荷绿', primary: '#98D8C8', secondary: '#F7DC6F', description: '清爽的绿黄配色，活力满满' },
  { name: '天空蓝', primary: '#6EC1E4', secondary: '#FFB6C1', description: '天空般的蓝粉配色，梦幻温柔' },
  { name: '薰衣草', primary: '#B19CD9', secondary: '#FFB7CE', description: '浪漫的紫粉配色，优雅梦幻' },
  { name: '珊瑚橙', primary: '#FF9A8B', secondary: '#96E6A1', description: '温暖的橙绿配色，青春活力' },
  { name: '奶油黄', primary: '#FFE66D', secondary: '#A8DADC', description: '温柔的黄蓝配色，清新明亮' },
];

function ThemeCustomizer({ userThemeConfig, onUpdateUserTheme, mode }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [primaryColor, setPrimaryColor] = useState(
    userThemeConfig?.primaryColor || '#4FC3F7'
  );
  const [secondaryColor, setSecondaryColor] = useState(
    userThemeConfig?.secondaryColor || '#66BB6A'
  );

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleApply = () => {
    onUpdateUserTheme({
      primaryColor,
      secondaryColor,
    });
    handleClose();
  };

  const handleReset = () => {
    setPrimaryColor('#4FC3F7');
    setSecondaryColor('#66BB6A');
    onUpdateUserTheme(null);
    localStorage.removeItem('userThemeConfig');
  };

  const handlePresetClick = (preset) => {
    setPrimaryColor(preset.primary);
    setSecondaryColor(preset.secondary);
    onUpdateUserTheme({
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
    });
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <Tooltip title="自定义主题配色">
        <IconButton
          onClick={handleOpen}
          sx={{
            color: mode === 'light' ? 'primary.main' : 'inherit',
          }}
        >
          <Palette />
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{
          // 移动端居中
          '& .MuiPopover-paper': {
            '@media (max-width: 600px)': {
              position: 'fixed !important',
              top: '50% !important',
              left: '50% !important',
              transform: 'translate(-50%, -50%) !important',
              maxWidth: '90vw',
              maxHeight: '80vh',
            },
          },
        }}
      >
        <Box sx={{ p: 3, minWidth: 300 }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            自定义主题配色
          </Typography>

          {/* 预设主题 */}
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2, mb: 1 }}>
            预设主题
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5, mb: 3 }}>
            {PRESET_THEMES.map((preset) => (
              <Tooltip key={preset.name} title={preset.description} arrow>
                <Button
                  onClick={() => handlePresetClick(preset)}
                  variant="outlined"
                  sx={{
                    minWidth: 0,
                    p: 1.5,
                    backgroundColor: preset.primary,
                    color: 'white',
                    borderColor: preset.secondary,
                    borderWidth: 2,
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    '&:hover': {
                      transform: 'scale(1.05)',
                      backgroundColor: preset.secondary,
                      borderColor: preset.primary,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  {preset.name}
                </Button>
              </Tooltip>
            ))}
          </Box>

          {/* 自定义颜色 */}
          <Typography variant="subtitle2" gutterBottom>
            自定义颜色
          </Typography>

          <Stack spacing={2} sx={{ mt: 1 }}>
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                主色调
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  style={{
                    width: '60px',
                    height: '40px',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                />
                <Typography variant="body2" sx={{ flexGrow: 1 }}>
                  {primaryColor}
                </Typography>
              </Box>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                辅色调
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  style={{
                    width: '60px',
                    height: '40px',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                />
                <Typography variant="body2" sx={{ flexGrow: 1 }}>
                  {secondaryColor}
                </Typography>
              </Box>
            </Box>
          </Stack>

          {/* 预览 */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              预览效果
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Box
                sx={{
                  flex: 1,
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: primaryColor,
                  color: 'white',
                  textAlign: 'center',
                }}
              >
                <Typography variant="caption" fontWeight={600}>
                  主色
                </Typography>
              </Box>
              <Box
                sx={{
                  flex: 1,
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: secondaryColor,
                  color: 'white',
                  textAlign: 'center',
                }}
              >
                <Typography variant="caption" fontWeight={600}>
                  辅色
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* 操作按钮 */}
          <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleReset}
              size="small"
            >
              恢复默认
            </Button>
            <Button
              variant="contained"
              onClick={handleApply}
              size="small"
              sx={{ flexGrow: 1 }}
            >
              应用
            </Button>
          </Stack>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            💡 配色保存在浏览器本地，更换浏览器需重新设置
          </Typography>
        </Box>
      </Popover>
    </>
  );
}

export default ThemeCustomizer;

