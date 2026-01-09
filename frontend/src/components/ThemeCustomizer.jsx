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

const PRESET_THEMES = [
  { name: '清新蓝绿', primary: '#4FC3F7', secondary: '#66BB6A' },
  { name: '薄荷绿', primary: '#81C784', secondary: '#4DD0E1' },
  { name: '天空蓝', primary: '#64B5F6', secondary: '#42A5F5' },
  { name: '樱花粉', primary: '#F48FB1', secondary: '#CE93D8' },
  { name: '柠檬黄', primary: '#FFD54F', secondary: '#FFB74D' },
  { name: '薰衣草', primary: '#BA68C8', secondary: '#9575CD' },
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
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mb: 3 }}>
            {PRESET_THEMES.map((preset) => (
              <Tooltip key={preset.name} title={preset.name}>
                <Button
                  onClick={() => handlePresetClick(preset)}
                  sx={{
                    minWidth: 0,
                    p: 2,
                    backgroundColor: preset.secondary,
                    '&:hover': {
                      opacity: 0.8,
                    },
                  }}
                >
                  {' '}
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
            <Box
              sx={{
                mt: 1,
                p: 2,
                borderRadius: 2,
                backgroundColor: secondaryColor,
                color: 'white',
                textAlign: 'center',
              }}
            >
              <Typography variant="body2" fontWeight={600}>
                按钮预览
              </Typography>
            </Box>
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

