import React from 'react';
import {
  Box,
  ListItem,
  ListItemText,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Stack,
} from '@mui/material';
import { ContentCopy, PlayCircleOutline } from '@mui/icons-material';

/**
 * 歌曲列表项 - PC端横向布局，移动端垂直布局
 * 使用 React.memo 避免父组件重渲染时全部列表项重渲染
 */
const SongListItem = React.memo(function SongListItem({
  song,
  onCopy,
  isLast,
  theme,
  isDesktop,
  onFilterByLanguage,
  onFilterByCategory,
  onFilterByLetter,
}) {
  const isDark = theme?.palette?.mode === 'dark';
  const isNewSong = song.isNewSong || false;

  // PC端：横向布局
  // 使用纯色背景替代 backdrop-filter，避免快速滑动时每项都重算模糊导致卡顿
  if (isDesktop) {
    const itemBgStyle = {
      backgroundColor: isNewSong
        ? (isDark ? 'rgba(110, 193, 228, 0.2)' : 'rgba(110, 193, 228, 0.12)')
        : (isDark ? 'rgba(30, 35, 55, 0.85)' : 'rgba(255, 255, 255, 0.9)'),
      contain: 'layout style paint',
    };

    return (
      <ListItem
        component="div"
        sx={{
          py: 1.5,
          px: 2.5,
          mb: 1,
          mx: 1,
          borderRadius: 2,
          ...itemBgStyle,
          border: isNewSong
            ? `2px solid ${isDark ? 'rgba(110, 193, 228, 0.5)' : 'rgba(110, 193, 228, 0.4)'}`
            : `1px solid ${theme.palette.divider}`,
          boxShadow: isNewSong
            ? (isDark ? '0 0 20px rgba(110, 193, 228, 0.3)' : '0 0 20px rgba(110, 193, 228, 0.2)')
            : 'none',
          '&:hover': {
            backgroundColor: isNewSong
              ? (isDark ? 'rgba(110, 193, 228, 0.25)' : 'rgba(110, 193, 228, 0.15)')
              : (isDark ? 'rgba(40, 45, 65, 0.6)' : 'rgba(255, 255, 255, 0.7)'),
            '& .copy-icon': { opacity: 1 },
          },
          transition: 'all 0.3s ease',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 200, flexShrink: 0 }}>
            <Tooltip title="点击复制歌曲名">
              <Typography
                variant="body1"
                fontWeight={isNewSong ? 700 : 600}
                onClick={() => onCopy(song.songName)}
                sx={{
                  cursor: 'pointer',
                  fontSize: '1rem',
                  color: isNewSong ? 'primary.main' : 'inherit',
                  '&:hover': { color: 'primary.main' },
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {song.songName}
              </Typography>
            </Tooltip>
            <IconButton size="small" className="copy-icon" onClick={() => onCopy(song.songName)} sx={{ opacity: 0, transition: 'opacity 0.2s', width: 28, height: 28 }}>
              <ContentCopy fontSize="small" />
            </IconButton>
            {isNewSong && (
              <Chip
                label="NEW"
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  backgroundColor: 'primary.main',
                  color: 'white',
                  animation: 'bounce 2s ease-in-out infinite',
                  '@keyframes bounce': { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-3px)' } },
                  '& .MuiChip-label': { px: 1 },
                }}
              />
            )}
          </Box>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: '0.875rem', minWidth: 120, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {song.singer}
          </Typography>
          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ flexGrow: 1, minWidth: 0 }}>
            <Tooltip title="点击筛选此语言">
              <Chip
                label={song.language}
                size="small"
                variant="outlined"
                onClick={() => onFilterByLanguage(song.language)}
                sx={{
                  height: 24,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'primary.main', color: 'white', borderColor: 'primary.main' },
                  transition: 'all 0.2s',
                  '& .MuiChip-label': { px: 1 },
                }}
              />
            </Tooltip>
            {(song.categories || [song.category]).map((cat, index) => (
              <Tooltip key={index} title="点击筛选此种类">
                <Chip
                  label={cat}
                  size="small"
                  variant="outlined"
                  onClick={() => onFilterByCategory(cat)}
                  sx={{
                    height: 24,
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: 'secondary.main', color: 'white', borderColor: 'secondary.main' },
                    transition: 'all 0.2s',
                    '& .MuiChip-label': { px: 1 },
                  }}
                />
              </Tooltip>
            ))}
            {song.special && (
              <Chip label="特殊" color="secondary" size="small" sx={{ height: 24, fontSize: '0.75rem', '& .MuiChip-label': { px: 1 } }} />
            )}
          </Stack>
          {song.bilibiliClipUrl && (
            <Tooltip title="观看B站切片">
              <IconButton
                size="small"
                onClick={() => window.open(song.bilibiliClipUrl, '_blank')}
                sx={{
                  color: '#00A1D6',
                  ml: 'auto',
                  flexShrink: 0,
                  '&:hover': { backgroundColor: 'rgba(0, 161, 214, 0.1)', transform: 'scale(1.1)' },
                  transition: 'all 0.2s',
                }}
              >
                <PlayCircleOutline />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </ListItem>
    );
  }

  // 移动端：垂直布局
  // 使用纯色背景替代 backdrop-filter，避免快速滑动时卡顿
  const mobileItemStyle = {
    backgroundColor: isNewSong
      ? (isDark ? 'rgba(110, 193, 228, 0.25)' : 'rgba(110, 193, 228, 0.15)')
      : (isDark ? 'rgba(30, 35, 55, 0.9)' : 'rgba(255, 255, 255, 0.85)'),
    contain: 'layout style paint',
  };

  return (
    <ListItem
      component="div"
      sx={{
        py: 2,
        px: { xs: 2.5, sm: 3 },
        mb: 1.5,
        mx: 0,
        borderRadius: 3,
        ...mobileItemStyle,
        border: isNewSong
          ? `2px solid ${isDark ? 'rgba(110, 193, 228, 0.6)' : 'rgba(110, 193, 228, 0.5)'}`
          : `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(110, 193, 228, 0.2)'}`,
        boxShadow: isNewSong
          ? (isDark ? '0 4px 20px rgba(110, 193, 228, 0.4)' : '0 4px 20px rgba(110, 193, 228, 0.25)')
          : (isDark ? '0 2px 8px rgba(0, 0, 0, 0.2)' : '0 2px 12px rgba(110, 193, 228, 0.12)'),
        '&:hover': {
          backgroundColor: isNewSong
            ? (isDark ? 'rgba(110, 193, 228, 0.3)' : 'rgba(110, 193, 228, 0.18)')
            : (isDark ? 'rgba(40, 45, 65, 0.7)' : 'rgba(255, 255, 255, 0.55)'),
          transform: 'translateY(-2px)',
          boxShadow: isNewSong
            ? (isDark ? '0 6px 28px rgba(110, 193, 228, 0.5)' : '0 6px 28px rgba(110, 193, 228, 0.35)')
            : (isDark ? '0 4px 16px rgba(0, 0, 0, 0.3)' : '0 4px 20px rgba(110, 193, 228, 0.2)'),
          '& .copy-icon': { opacity: 1 },
        },
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <ListItemText
        primaryTypographyProps={{ component: 'div' }}
        secondaryTypographyProps={{ component: 'div' }}
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25, flexWrap: 'wrap' }}>
            <Tooltip title="点击复制歌曲名">
              <Typography
                variant="body1"
                fontWeight={isNewSong ? 800 : 700}
                onClick={() => onCopy(song.songName)}
                sx={{
                  flexGrow: 1,
                  cursor: 'pointer',
                  fontSize: { xs: '1rem', sm: '1.05rem' },
                  letterSpacing: '0.02em',
                  color: isNewSong ? 'primary.main' : 'text.primary',
                  '&:hover': { color: 'primary.main' },
                  transition: 'color 0.2s ease',
                }}
              >
                {song.songName}
              </Typography>
            </Tooltip>
            {isNewSong && (
              <Chip
                label="NEW"
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  backgroundColor: 'primary.main',
                  color: 'white',
                  animation: 'bounce 2s ease-in-out infinite',
                  '@keyframes bounce': { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-3px)' } },
                  '& .MuiChip-label': { px: 0.75 },
                }}
              />
            )}
            <IconButton size="small" className="copy-icon" onClick={() => onCopy(song.songName)} sx={{ opacity: 0, transition: 'opacity 0.2s', width: 28, height: 28, ml: 0.5 }}>
              <ContentCopy fontSize="small" />
            </IconButton>
            {song.special && (
              <Chip label="特殊" color="secondary" size="small" sx={{ height: 20, fontSize: '0.65rem', '& .MuiChip-label': { px: 0.75 } }} />
            )}
            {song.bilibiliClipUrl && (
              <Tooltip title="观看B站切片">
                <IconButton
                  size="small"
                  onClick={() => window.open(song.bilibiliClipUrl, '_blank')}
                  sx={{ color: '#00A1D6', width: 28, height: 28, '&:hover': { backgroundColor: 'rgba(0, 161, 214, 0.1)' } }}
                >
                  <PlayCircleOutline fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        }
        secondary={
          <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 0.25 }}>
            <Typography
              variant="body2"
              sx={{
                fontSize: { xs: '0.85rem', sm: '0.9rem' },
                color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(42, 63, 95, 0.7)',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                '&::before': { content: '"♪"', marginRight: '6px', color: 'primary.main', fontSize: '0.9rem' },
              }}
            >
              {song.singer}
            </Typography>
            <Tooltip title="点击筛选此语言">
              <Chip
                label={song.language}
                size="small"
                variant="filled"
                onClick={() => onFilterByLanguage(song.language)}
                sx={{
                  height: 22,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: isDark ? 'rgba(110, 193, 228, 0.15)' : 'rgba(110, 193, 228, 0.12)',
                  color: 'primary.main',
                  border: `1px solid ${isDark ? 'rgba(110, 193, 228, 0.3)' : 'rgba(110, 193, 228, 0.25)'}`,
                  '&:hover': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    transform: 'scale(1.05)',
                    boxShadow: '0 2px 8px rgba(110, 193, 228, 0.3)',
                  },
                  transition: 'all 0.2s ease',
                  '& .MuiChip-label': { px: 1 },
                }}
              />
            </Tooltip>
            {(song.categories || [song.category]).map((cat, index) => (
              <Tooltip key={index} title="点击筛选此种类">
                <Chip
                  label={cat}
                  size="small"
                  variant="filled"
                  onClick={() => onFilterByCategory(cat)}
                  sx={{
                    height: 22,
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    backgroundColor: isDark ? 'rgba(255, 182, 193, 0.15)' : 'rgba(255, 182, 193, 0.12)',
                    color: 'secondary.main',
                    border: `1px solid ${isDark ? 'rgba(255, 182, 193, 0.3)' : 'rgba(255, 182, 193, 0.25)'}`,
                    '&:hover': {
                      backgroundColor: 'secondary.main',
                      color: 'white',
                      transform: 'scale(1.05)',
                      boxShadow: '0 2px 8px rgba(255, 182, 193, 0.3)',
                    },
                    transition: 'all 0.2s ease',
                    '& .MuiChip-label': { px: 1 },
                  }}
                />
              </Tooltip>
            ))}
          </Stack>
        }
      />
    </ListItem>
  );
});

export default SongListItem;
