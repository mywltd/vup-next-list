import React from 'react';
import { Box, Typography } from '@mui/material';
import { MusicNote } from '@mui/icons-material';

/**
 * 首页标题区：头像（移动端）+ 歌单名 + 歌曲数量
 */
const HomePageHeader = React.memo(function HomePageHeader({
  avatarUrl,
  siteConfig,
  isDesktop,
  total,
  theme,
}) {
  return (
    <Box sx={{ mb: 4, textAlign: 'center', position: 'relative', zIndex: 1 }}>
      {avatarUrl && !isDesktop && (
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
          <Box
            sx={{
              width: { xs: 100, sm: 120 },
              height: { xs: 100, sm: 120 },
              borderRadius: '50%',
              overflow: 'hidden',
              border: '4px solid',
              borderColor: theme.palette.mode === 'dark'
                ? 'rgba(110, 193, 228, 0.3)'
                : 'rgba(110, 193, 228, 0.4)',
              backgroundColor: theme.palette.mode === 'dark'
                ? 'rgba(20, 25, 45, 0.9)'
                : 'rgba(255, 255, 255, 0.9)',
              padding: '4px',
              boxShadow: theme.palette.mode === 'dark'
                ? '0 8px 24px rgba(0, 0, 0, 0.4)'
                : '0 8px 24px rgba(110, 193, 228, 0.25)',
              animation: 'float 3s ease-in-out infinite',
              '@keyframes float': {
                '0%, 100%': { transform: 'translateY(0px)' },
                '50%': { transform: 'translateY(-10px)' },
              },
            }}
          >
            <Box
              component="img"
              src={avatarUrl}
              alt="头像"
              loading="lazy"
              sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
            />
          </Box>
        </Box>
      )}
      <Typography
        variant={isDesktop ? 'h3' : 'h4'}
        fontWeight={700}
        color="primary"
        sx={{ mb: 1.5, letterSpacing: '0.02em' }}
      >
        {siteConfig?.defaultPlaylistName || '歌单'}
      </Typography>
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1,
          px: 2.5,
          py: 0.75,
          borderRadius: 20,
          backgroundColor: theme.palette.mode === 'dark'
            ? 'rgba(110, 193, 228, 0.2)'
            : 'rgba(110, 193, 228, 0.15)',
          border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(110, 193, 228, 0.3)' : 'rgba(110, 193, 228, 0.25)'}`,
        }}
      >
        <MusicNote sx={{ fontSize: 18, color: 'primary.main' }} />
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
          共收录 {total} 首歌曲
        </Typography>
      </Box>
    </Box>
  );
});

export default HomePageHeader;
