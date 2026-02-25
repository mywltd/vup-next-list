import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Pagination,
  CircularProgress,
} from '@mui/material';
import { MusicNote } from '@mui/icons-material';
import VirtualizedSongList from './VirtualizedSongList';

/**
 * 歌曲列表面板：loading/空态/列表+分页，含独立模糊层
 */
const SongListPanel = React.memo(function SongListPanel({
  loading,
  songs,
  totalPages,
  page,
  onPageChange,
  onCopy,
  onFilterByLanguage,
  onFilterByCategory,
  onFilterByLetter,
  isDesktop,
  theme,
  paperListBaseStyle,
  paperListBlurLayerStyle,
  paperListStyleMobile,
  showHeader,
}) {
  const isMobile = !isDesktop;

  const renderContent = () => {
    if (loading) {
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            py: 8,
            minHeight: '300px',
          }}
        >
          <CircularProgress size={isDesktop ? 60 : 50} />
        </Box>
      );
    }
    if (songs.length === 0) {
      return (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '300px',
          }}
        >
          <MusicNote sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            暂无歌曲
          </Typography>
        </Box>
      );
    }
    return (
      <>
        <Box sx={{ px: isDesktop ? 2 : 1, py: 1.5 }}>
          <VirtualizedSongList
            songs={songs}
            onCopy={onCopy}
            onFilterByLanguage={onFilterByLanguage}
            onFilterByCategory={onFilterByCategory}
            onFilterByLetter={onFilterByLetter}
            isDesktop={isDesktop}
            theme={theme}
          />
        </Box>
        {totalPages > 1 && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              py: 2.5,
              px: isDesktop ? 2 : 0,
              mt: 2,
              borderTop: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(110, 193, 228, 0.15)'}`,
              backgroundColor: isMobile
                ? (theme.palette.mode === 'dark' ? 'rgba(20, 25, 45, 0.5)' : 'rgba(255, 255, 255, 0.5)')
                : 'transparent',
            }}
          >
            <Pagination
              count={totalPages}
              page={page}
              onChange={onPageChange}
              color="primary"
              size="medium"
              showFirstButton
              showLastButton
              sx={
                isMobile
                  ? {
                      '& .MuiPaginationItem-root': {
                        fontWeight: 600,
                        borderRadius: 2,
                        '&:hover': {
                          transform: 'scale(1.1)',
                          backgroundColor: 'primary.main',
                          color: 'white',
                        },
                        transition: 'all 0.2s ease',
                      },
                      '& .Mui-selected': {
                        backgroundColor: 'primary.main',
                        color: 'white',
                        fontWeight: 700,
                        boxShadow: '0 2px 8px rgba(110, 193, 228, 0.3)',
                      },
                    }
                  : undefined
              }
            />
          </Box>
        )}
      </>
    );
  };

  return (
    <Paper sx={isMobile ? paperListStyleMobile : paperListBaseStyle}>
      <Box sx={paperListBlurLayerStyle} aria-hidden="true" />
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {showHeader && (
          <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
              歌曲列表
            </Typography>
            <Typography variant="caption" color="text.secondary">
              根据您的歌单内容
            </Typography>
          </Box>
        )}
        {renderContent()}
      </Box>
    </Paper>
  );
});

export default SongListPanel;
