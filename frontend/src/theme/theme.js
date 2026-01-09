import { createTheme } from '@mui/material/styles';

// 二次元风格主题配置
export const createAnimeTheme = (mode = 'light', customConfig = {}) => {
  const isDark = mode === 'dark';

  // 默认主题色（轻动漫风格 - 天空蓝配色）
  const primaryColor = customConfig.primaryColor || '#6EC1E4'; // 天空蓝
  const secondaryColor = customConfig.secondaryColor || '#FFB6C1'; // 浅粉色

  return createTheme({
    palette: {
      mode,
      primary: {
        main: primaryColor,
        light: isDark ? '#8FD3F0' : '#5AB8DD',
        dark: isDark ? '#4BA8CC' : '#3A8FB5',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: secondaryColor,
        light: isDark ? '#FFC9D4' : '#FFA3B5',
        dark: isDark ? '#FF8FA8' : '#E6899A',
        contrastText: '#FFFFFF',
      },
      background: {
        default: isDark ? '#0D0F1C' : '#F8FBFF', // 更柔和的浅蓝白
        paper: isDark ? 'rgba(20, 25, 45, 0.8)' : 'rgba(255, 255, 255, 0.6)',
      },
      text: {
        primary: isDark ? '#E8E9FF' : '#2A3F5F', // 更柔和的深蓝灰
        secondary: isDark ? '#A0A5C8' : '#6B7C95', // 更清新的灰蓝
      },
      divider: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(110, 193, 228, 0.12)', // 淡蓝色分割线
      error: {
        main: '#FF6B8A', // 更柔和的粉红错误色
      },
      warning: {
        main: '#FFB366', // 温暖的橙色
      },
      info: {
        main: '#6EC1E4', // 与主色调一致的天空蓝
      },
      success: {
        main: '#98D8C8', // 薄荷绿成功色
      },
    },
    typography: {
      fontFamily: '"Noto Sans SC", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
        fontSize: '3rem',
        letterSpacing: '-0.02em',
      },
      h2: {
        fontWeight: 700,
        fontSize: '2.5rem',
        letterSpacing: '-0.01em',
      },
      h3: {
        fontWeight: 600,
        fontSize: '2rem',
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.75rem',
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.5rem',
      },
      h6: {
        fontWeight: 600,
        fontSize: '1.25rem',
      },
      button: {
        textTransform: 'none',
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 16,
    },
    shadows: isDark
      ? [
          'none',
          '0px 2px 8px rgba(0, 0, 0, 0.4)',
          '0px 4px 16px rgba(0, 0, 0, 0.4)',
          '0px 6px 24px rgba(0, 0, 0, 0.4)',
          '0px 8px 32px rgba(0, 0, 0, 0.5)',
          ...Array(20).fill('0px 10px 40px rgba(0, 0, 0, 0.6)'),
        ]
      : [
          'none',
          '0px 2px 8px rgba(110, 193, 228, 0.08)', // 天空蓝色阴影
          '0px 4px 16px rgba(110, 193, 228, 0.10)',
          '0px 6px 24px rgba(110, 193, 228, 0.12)',
          '0px 8px 32px rgba(110, 193, 228, 0.14)',
          ...Array(20).fill('0px 10px 40px rgba(110, 193, 228, 0.16)'),
        ],
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            padding: '10px 24px',
            fontWeight: 600,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: `0px 4px 12px ${secondaryColor}40`,
              transform: 'translateY(-2px)',
              transition: 'all 0.3s ease',
            },
          },
          contained: {
            backgroundColor: secondaryColor,
            color: '#FFFFFF',
            '&:hover': {
              backgroundColor: isDark 
                ? `${secondaryColor}DD` 
                : `${secondaryColor}CC`,
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            // 液态玻璃效果
            backdropFilter: 'blur(20px) saturate(180%)',
            backgroundColor: isDark
              ? 'rgba(20, 25, 45, 0.75)'
              : 'rgba(255, 255, 255, 0.5)',
            border: isDark
              ? '1px solid rgba(255, 255, 255, 0.1)'
              : '1px solid rgba(110, 193, 228, 0.15)', // 天空蓝边框
            boxShadow: isDark
              ? '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
              : '0 8px 32px 0 rgba(110, 193, 228, 0.12)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backdropFilter: 'blur(20px) saturate(180%)',
            backgroundColor: isDark
              ? 'rgba(20, 25, 45, 0.75)'
              : 'rgba(255, 255, 255, 0.5)',
            border: isDark
              ? '1px solid rgba(255, 255, 255, 0.1)'
              : '1px solid rgba(110, 193, 228, 0.15)', // 天空蓝边框
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: isDark
                ? '0 12px 40px 0 rgba(110, 193, 228, 0.3)'
                : '0 12px 40px 0 rgba(110, 193, 228, 0.18)', // 天空蓝悬浮阴影
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backdropFilter: 'blur(20px) saturate(180%)',
            backgroundColor: isDark
              ? 'rgba(20, 25, 45, 0.85)'
              : 'rgba(255, 255, 255, 0.85)',
            boxShadow: isDark
              ? '0 4px 30px rgba(0, 0, 0, 0.5)'
              : '0 4px 30px rgba(123, 104, 238, 0.1)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              backdropFilter: 'blur(10px)',
              backgroundColor: isDark
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(255, 255, 255, 0.6)',
              borderRadius: 12,
              '&:hover': {
                backgroundColor: isDark
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'rgba(255, 255, 255, 0.8)',
              },
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            backdropFilter: 'blur(10px)',
            fontWeight: 500,
          },
        },
      },
    },
  });
};

export default createAnimeTheme;

