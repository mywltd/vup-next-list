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
  { name: '默认粉紫', primary: '#FF6B9D', secondary: '#7B68EE' },
  { name: '蓝紫渐变', primary: '#64B5F6', secondary: '#9C27B0' },
  { name: '绿松石', primary: '#26A69A', secondary: '#00897B' },
  { name: '橙粉红', primary: '#FF9800', secondary: '#E91E63' },
  { name: '青蓝色', primary: '#00BCD4', secondary: '#3F51B5' },
  { name: '紫红渐变', primary: '#AB47BC', secondary: '#F06292' },
];

function ThemeCustomizer({ userThemeConfig, onUpdateUserTheme, mode }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [primaryColor, setPrimaryColor] = useState(
    userThemeConfig?.primaryColor || '#FF6B9D'
  );
  const [secondaryColor, setSecondaryColor] = useState(
    userThemeConfig?.secondaryColor || '#7B68EE'
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
    setPrimaryColor('#FF6B9D');
    setSecondaryColor('#7B68EE');
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
                    background: `linear-gradient(135deg, ${preset.primary} 0%, ${preset.secondary} 100%)`,
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
          <Box
            sx={{
              mt: 2,
              p: 2,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
              color: 'white',
              textAlign: 'center',
            }}
          >
            <Typography variant="body2" fontWeight={600}>
              预览效果
            </Typography>
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

