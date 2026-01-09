import { createTheme } from '@mui/material/styles';

// 二次元风格主题配置
export const createAnimeTheme = (mode = 'light', customConfig = {}) => {
  const isDark = mode === 'dark';

  // 默认主题色（可以被用户自定义覆盖）
  const primaryColor = customConfig.primaryColor || '#4FC3F7'; // 清新蓝
  const secondaryColor = customConfig.secondaryColor || '#66BB6A'; // 清新绿

  return createTheme({
    palette: {
      mode,
      primary: {
        main: primaryColor,
        light: isDark ? '#FF8FB5' : '#FF4A7C',
        dark: isDark ? '#CC5680' : '#E63973',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: secondaryColor,
        light: isDark ? '#9A89F7' : '#6956E0',
        dark: isDark ? '#5E4DC7' : '#503DB8',
        contrastText: '#FFFFFF',
      },
      background: {
        default: isDark ? '#0D0F1C' : '#F5F7FF',
        paper: isDark ? 'rgba(20, 25, 45, 0.8)' : 'rgba(255, 255, 255, 0.6)',
      },
      text: {
        primary: isDark ? '#E8E9FF' : '#1A1F3D',
        secondary: isDark ? '#A0A5C8' : '#5A5F7D',
      },
      divider: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
      error: {
        main: '#FF5252',
      },
      warning: {
        main: '#FFB74D',
      },
      info: {
        main: '#64B5F6',
      },
      success: {
        main: '#81C784',
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
          '0px 2px 8px rgba(123, 104, 238, 0.12)',
          '0px 4px 16px rgba(123, 104, 238, 0.12)',
          '0px 6px 24px rgba(123, 104, 238, 0.12)',
          '0px 8px 32px rgba(123, 104, 238, 0.15)',
          ...Array(20).fill('0px 10px 40px rgba(123, 104, 238, 0.18)'),
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
              : '1px solid rgba(123, 104, 238, 0.1)',
            boxShadow: isDark
              ? '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
              : '0 8px 32px 0 rgba(123, 104, 238, 0.1)',
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
              : '1px solid rgba(123, 104, 238, 0.1)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: isDark
                ? '0 12px 40px 0 rgba(123, 104, 238, 0.3)'
                : '0 12px 40px 0 rgba(123, 104, 238, 0.15)',
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

