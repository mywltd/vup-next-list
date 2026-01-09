import React from 'react';
import { Box, Typography } from '@mui/material';
import { MusicNote } from '@mui/icons-material';

function LoadingPage() {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        // 动态模糊背景
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        // 玻璃质感
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 8px 32px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* 跳动的音符动画 */}
      <Box
        sx={{
          position: 'relative',
          mb: 4,
        }}
      >
        <MusicNote
          sx={{
            fontSize: { xs: 60, sm: 80, md: 100 },
            color: 'primary.main',
            animation: 'bounce 1.5s ease-in-out infinite',
            '@keyframes bounce': {
              '0%, 100%': {
                transform: 'translateY(0) scale(1)',
              },
              '50%': {
                transform: 'translateY(-20px) scale(1.1)',
              },
            },
          }}
        />
      </Box>

      {/* 文字 */}
      <Typography
        variant="h6"
        sx={{
          color: 'text.primary',
          fontWeight: 500,
          fontSize: { xs: '1rem', sm: '1.25rem' },
          letterSpacing: '0.1em',
        }}
      >
        数据传送中...
      </Typography>
    </Box>
  );
}

export default LoadingPage;

