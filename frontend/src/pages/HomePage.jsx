import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Chip,
  Pagination,
  Stack,
  InputAdornment,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  Tooltip,
  useMediaQuery,
  useTheme,
  Drawer,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
} from '@mui/material';
import { Search, ContentCopy, MusicNote, FilterList, Language, Category, Star, Refresh, PlayCircleOutline, Warning } from '@mui/icons-material';
import { playlistAPI } from '../services/api';
import { debounce, copyToClipboard, getLetterColor, isLowPerformanceEnv, getOptimizedBackdropStyle, isWeChatBrowser } from '../utils/helpers';
import { useSearch } from '../components/AppLayout';
import { getCachedImage, cacheImage } from '../utils/imageCache';

function HomePage({ siteConfig }) {
  // ⚠️ 最高优先级：检测微信浏览器
  const isWeChat = React.useMemo(() => isWeChatBrowser(), []);
  const [weChatConfirmed, setWeChatConfirmed] = useState(() => {
    // 初始化时立即检查 sessionStorage
    if (isWeChat) {
      return sessionStorage.getItem('wechat-confirmed') === 'true';
    }
    return true; // 非微信浏览器直接通过
  });

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(siteConfig?.avatarUrl || '');
  
  // 检测是否为低性能环境（微信浏览器等）
  const isLowPerf = React.useMemo(() => isLowPerformanceEnv(), []);
  
  // 从Context获取搜索文本
  const { searchText, setSearchText } = useSearch();
  
  // 将theme传递给子组件
  const songListProps = { theme };
  
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  // 筛选条件 - 改为多选
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [selectedLanguages, setSelectedLanguages] = useState([]); // 改为数组
  const [selectedCategories, setSelectedCategories] = useState([]); // 新增种类筛选
  const [selectedSpecial, setSelectedSpecial] = useState(null);

  // 加载并缓存头像
  useEffect(() => {
    if (siteConfig?.avatarUrl) {
      setAvatarUrl(siteConfig.avatarUrl); // 立即显示原始 URL
      
      const cached = getCachedImage(siteConfig.avatarUrl);
      if (cached) {
        setAvatarUrl(cached); // 有缓存就用缓存
      } else {
        // 后台缓存，成功后更新（失败也不影响显示）
        cacheImage(siteConfig.avatarUrl).then(cachedUrl => {
          if (cachedUrl && cachedUrl !== siteConfig.avatarUrl) {
            // 只有缓存成功且不是原 URL 才更新
            setAvatarUrl(cachedUrl);
          }
        }).catch(err => {
          console.debug('头像缓存失败，继续使用原始 URL:', err.message);
        });
      }
    }
  }, [siteConfig?.avatarUrl]);
  
  // 可用的筛选选项（标签云）
  const [languages, setLanguages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [firstLetters, setFirstLetters] = useState([]);
  const [hasXiqu, setHasXiqu] = useState(false); // 是否有戏曲标签
  
  // 提示消息
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // 加载歌单
  const loadPlaylist = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 50,
        search: searchText,
      };
      
      if (selectedLetter) params.firstLetter = selectedLetter;
      // 支持多选语言筛选 - 传递完整数组
      if (selectedLanguages.length > 0) {
        params.languages = selectedLanguages.join(',');
      }
      // 支持多选种类筛选 - 传递完整数组
      if (selectedCategories.length > 0) {
        params.categories = selectedCategories.join(',');
      }
      if (selectedSpecial !== null) params.special = selectedSpecial;
      
      const data = await playlistAPI.getPlaylist(params);
      setSongs(data.songs);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (error) {
      console.error('加载歌单失败:', error);
      setSnackbar({ open: true, message: '加载歌单失败', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [page, searchText, selectedLetter, selectedLanguages, selectedCategories, selectedSpecial]);

  // 加载筛选选项（标签云）
  useEffect(() => {
    // 如果是微信浏览器且用户未确认，则不加载
    if (isWeChat && !weChatConfirmed) {
      return;
    }
    
    const loadFilters = async () => {
      try {
        const tagCloud = await playlistAPI.getTagCloud();
        setLanguages(tagCloud.languages || []);
        const cats = tagCloud.categories || [];
        setCategories(cats);
        setFirstLetters(tagCloud.firstLetters || []);
        
        // 检查是否有戏曲标签
        setHasXiqu(cats.includes('戏曲'));
      } catch (error) {
        console.error('加载标签云失败:', error);
      }
    };
    loadFilters();
  }, [isWeChat, weChatConfirmed]);

  // 加载歌单（带防抖）
  useEffect(() => {
    // 如果是微信浏览器且用户未确认，则不加载
    if (isWeChat && !weChatConfirmed) {
      return;
    }
    
    const debouncedLoad = debounce(loadPlaylist, 300);
    debouncedLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    page, 
    searchText, 
    selectedLetter, 
    selectedLanguages.join(','), // 转为字符串避免数组引用问题
    selectedCategories.join(','), // 转为字符串避免数组引用问题
    selectedSpecial, 
    isWeChat, 
    weChatConfirmed
  ]);

  const handlePageChange = useCallback((event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleCopy = useCallback(async (songName) => {
    // 根据站点配置的复制模式决定复制内容
    const copyMode = siteConfig?.copyMode || 'normal';
    let textToCopy = songName;
    
    if (copyMode === 'song-request') {
      textToCopy = `点歌 ${songName}`;
    }
    
    const success = await copyToClipboard(textToCopy);
    if (success) {
      setSnackbar({ open: true, message: `已复制: ${songName}`, severity: 'success' });
    } else {
      setSnackbar({ open: true, message: '复制失败', severity: 'error' });
    }
  }, [siteConfig?.copyMode]);

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  const clearFilters = useCallback(() => {
    setSearchText('');
    setSelectedLetter(null);
    setSelectedLanguages([]);
    setSelectedCategories([]);
    setSelectedSpecial(null);
    setPage(1);
  }, [setSearchText]);

  // 优化筛选回调函数 - 支持多选切换
  const handleFilterByLanguage = useCallback((lang) => {
    setSelectedLanguages(prev => {
      if (prev.includes(lang)) {
        // 如果已选中，则取消选中
        return prev.filter(l => l !== lang);
      } else {
        // 如果未选中，则添加选中
        return [...prev, lang];
      }
    });
    setPage(1);
  }, []);

  const handleFilterByCategory = useCallback((cat) => {
    setSelectedCategories(prev => {
      if (prev.includes(cat)) {
        // 如果已选中，则取消选中
        return prev.filter(c => c !== cat);
      } else {
        // 如果未选中，则添加选中
        return [...prev, cat];
      }
    });
    setPage(1);
  }, []);

  const handleFilterByLetter = useCallback((letter) => {
    setSelectedLetter(letter);
    setPage(1);
  }, []);

  // 处理微信提示确认
  const handleWeChatConfirm = useCallback(() => {
    sessionStorage.setItem('wechat-confirmed', 'true');
    setWeChatConfirmed(true);
  }, []);

  // 复制当前页面链接
  const handleCopyUrl = useCallback(async () => {
    const url = window.location.href;
    const success = await copyToClipboard(url);
    if (success) {
      setSnackbar({ open: true, message: '链接已复制到剪贴板', severity: 'success' });
    } else {
      setSnackbar({ open: true, message: '复制失败，请点击右上角从浏览器打开', severity: 'error' });
    }
  }, []);


  // 筛选器组件 - 标签云形式
  const FilterPanel = () => {
    return (
    <Box>
      {/* 首字母筛选 */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Typography variant="subtitle2" fontWeight={600} color="primary">
            首字母
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
          {firstLetters.map((letter) => (
            <Chip
              key={letter}
              label={letter}
              size="small"
              onClick={() => {
                setSelectedLetter(selectedLetter === letter ? null : letter);
                setPage(1);
              }}
              sx={{
                cursor: 'pointer',
                backgroundColor: selectedLetter === letter 
                  ? 'primary.main' 
                  : theme.palette.mode === 'dark'
                    ? 'rgba(110, 193, 228, 0.15)'
                    : 'rgba(110, 193, 228, 0.12)',
                color: selectedLetter === letter ? 'white' : 'primary.main',
                border: `1px solid ${selectedLetter === letter ? 'primary.main' : 'rgba(110, 193, 228, 0.3)'}`,
                fontWeight: selectedLetter === letter ? 700 : 600,
                '&:hover': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s ease',
              }}
            />
          ))}
        </Box>
      </Box>

      {/* 语言筛选 */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Typography variant="subtitle2" fontWeight={600} color="primary">
            语言
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
          {languages.map((lang) => (
            <Chip
              key={lang}
              label={lang}
              size="small"
              onClick={() => {
                if (selectedLanguages.includes(lang)) {
                  setSelectedLanguages(selectedLanguages.filter(l => l !== lang));
                } else {
                  setSelectedLanguages([...selectedLanguages, lang]);
                }
                setPage(1);
              }}
              sx={{
                cursor: 'pointer',
                backgroundColor: selectedLanguages.includes(lang)
                  ? 'primary.main'
                  : theme.palette.mode === 'dark'
                    ? 'rgba(110, 193, 228, 0.15)'
                    : 'rgba(110, 193, 228, 0.12)',
                color: selectedLanguages.includes(lang) ? 'white' : 'primary.main',
                border: `1px solid ${selectedLanguages.includes(lang) ? 'primary.main' : 'rgba(110, 193, 228, 0.3)'}`,
                fontWeight: selectedLanguages.includes(lang) ? 700 : 600,
                '&:hover': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s ease',
              }}
            />
          ))}
        </Box>
      </Box>

      {/* 戏曲筛选（如果存在戏曲标签） */}
      {hasXiqu && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ color: '#d32f2f' }}>
              戏曲专区
            </Typography>
          </Box>
          <Chip
            label="🎭 戏曲"
            size="medium"
            onClick={() => {
              if (selectedCategories.includes('戏曲')) {
                setSelectedCategories(selectedCategories.filter(c => c !== '戏曲'));
              } else {
                setSelectedCategories([...selectedCategories, '戏曲']);
              }
              setPage(1);
            }}
            sx={{
              cursor: 'pointer',
              backgroundColor: selectedCategories.includes('戏曲')
                ? '#d32f2f'
                : theme.palette.mode === 'dark'
                  ? 'rgba(211, 47, 47, 0.15)'
                  : 'rgba(211, 47, 47, 0.12)',
              color: selectedCategories.includes('戏曲') ? 'white' : '#d32f2f',
              border: `1px solid ${selectedCategories.includes('戏曲') ? '#d32f2f' : 'rgba(211, 47, 47, 0.3)'}`,
              fontWeight: 700,
              fontSize: '0.9rem',
              height: 32,
              '&:hover': {
                backgroundColor: '#d32f2f',
                color: 'white',
                transform: 'scale(1.05)',
                boxShadow: '0 4px 12px rgba(211, 47, 47, 0.3)',
              },
              transition: 'all 0.2s ease',
            }}
          />
        </Box>
      )}

      {/* 种类筛选 */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Typography variant="subtitle2" fontWeight={600} color="secondary">
            种类
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
          {categories.filter(cat => cat !== '戏曲').map((cat) => (
            <Chip
              key={cat}
              label={cat}
              size="small"
              onClick={() => {
                if (selectedCategories.includes(cat)) {
                  setSelectedCategories(selectedCategories.filter(c => c !== cat));
                } else {
                  setSelectedCategories([...selectedCategories, cat]);
                }
                setPage(1);
              }}
              sx={{
                cursor: 'pointer',
                backgroundColor: selectedCategories.includes(cat)
                  ? 'secondary.main'
                  : theme.palette.mode === 'dark'
                    ? 'rgba(255, 182, 193, 0.15)'
                    : 'rgba(255, 182, 193, 0.12)',
                color: selectedCategories.includes(cat) ? 'white' : 'secondary.main',
                border: `1px solid ${selectedCategories.includes(cat) ? 'secondary.main' : 'rgba(255, 182, 193, 0.3)'}`,
                fontWeight: selectedCategories.includes(cat) ? 700 : 600,
                '&:hover': {
                  backgroundColor: 'secondary.main',
                  color: 'white',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s ease',
              }}
            />
          ))}
        </Box>
      </Box>

      {/* 特殊歌曲筛选 */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
            特殊歌曲
          </Typography>
        </Box>
        <Chip
          label="仅显示特殊歌曲"
          size="small"
          icon={<Star sx={{ fontSize: 16 }} />}
          onClick={() => {
            setSelectedSpecial(selectedSpecial === true ? null : true);
            setPage(1);
          }}
          sx={{
            cursor: 'pointer',
            backgroundColor: selectedSpecial === true
              ? 'secondary.main'
              : theme.palette.mode === 'dark'
                ? 'rgba(255, 182, 193, 0.15)'
                : 'rgba(255, 182, 193, 0.12)',
            color: selectedSpecial === true ? 'white' : 'secondary.main',
            border: `1px solid ${selectedSpecial === true ? 'secondary.main' : 'rgba(255, 182, 193, 0.3)'}`,
            fontWeight: selectedSpecial === true ? 700 : 600,
            '&:hover': {
              backgroundColor: 'secondary.main',
              color: 'white',
              transform: 'scale(1.05)',
            },
            transition: 'all 0.2s ease',
          }}
        />
      </Box>

      {/* 重置筛选按钮 */}
      <Button
        fullWidth
        variant="outlined"
        onClick={clearFilters}
        startIcon={<Refresh />}
        size="small"
        sx={{
          mt: 2,
          borderColor: 'divider',
          '&:hover': {
            borderColor: 'primary.main',
          },
        }}
      >
        重置筛选
      </Button>
    </Box>
    );
  };

  // ⚠️ 微信浏览器提示页面 - 最高优先级渲染
  if (isWeChat && !weChatConfirmed) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
          py: 4,
        }}
      >
        <Box
          sx={{
            maxWidth: 500,
            width: '100%',
            textAlign: 'center',
          }}
        >
          {/* 图标 */}
          <Box
            sx={{
              display: 'inline-flex',
              p: 3,
              borderRadius: '50%',
              backgroundColor: theme.palette.mode === 'dark'
                ? 'rgba(255, 193, 7, 0.1)'
                : 'rgba(255, 193, 7, 0.08)',
              mb: 3,
            }}
          >
            <Warning
              sx={{
                fontSize: 64,
                color: 'warning.main',
              }}
            />
          </Box>

          {/* 标题 */}
          <Typography
            variant="h5"
            fontWeight={700}
            gutterBottom
            sx={{ mb: 2 }}
          >
            温馨提示
          </Typography>

          {/* 说明 */}
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 3, lineHeight: 1.8 }}
          >
            检测到您正在<strong>微信内置浏览器</strong>中打开本页面
          </Typography>

          {/* 警告信息 */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: 2,
              backgroundColor: theme.palette.mode === 'dark'
                ? 'rgba(255, 193, 7, 0.1)'
                : 'rgba(255, 193, 7, 0.08)',
              border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 193, 7, 0.3)' : 'rgba(255, 193, 7, 0.2)'}`,
              mb: 2.5,
              textAlign: 'left',
            }}
          >
            <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 600 }}>
              ⚠️ 微信浏览器限制：
            </Typography>
            <Typography variant="body2" color="text.secondary" component="div" sx={{ lineHeight: 1.8, fontSize: '0.875rem' }}>
              • 视觉效果可能无法正常显示<br />
              • 页面性能受限，可能卡顿<br />
              • 部分功能可能不兼容
            </Typography>
          </Box>

          {/* 建议 */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: 2,
              backgroundColor: theme.palette.mode === 'dark'
                ? 'rgba(110, 193, 228, 0.1)'
                : 'rgba(110, 193, 228, 0.08)',
              border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(110, 193, 228, 0.3)' : 'rgba(110, 193, 228, 0.2)'}`,
              mb: 3,
              textAlign: 'left',
            }}
          >
            <Typography variant="body2" color="primary" sx={{ mb: 1.5, fontWeight: 600 }}>
              💡 获得最佳体验：
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, fontSize: '0.875rem' }}>
              点击右上角 <strong>「···」</strong> 菜单 →<br />
              选择<strong>「在浏览器中打开」</strong>
            </Typography>
          </Box>

          {/* 操作按钮 */}
          <Stack spacing={1.5}>
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleWeChatConfirm}
              sx={{
                py: 1.5,
                fontWeight: 600,
                fontSize: '1rem',
              }}
            >
              我知道了，继续访问
            </Button>
            <Button
              variant="outlined"
              size="large"
              fullWidth
              startIcon={<ContentCopy />}
              onClick={handleCopyUrl}
              sx={{
                py: 1.5,
                fontWeight: 500,
              }}
            >
              复制链接到浏览器打开
            </Button>
          </Stack>

          {/* Snackbar for copy feedback */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={3000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert
              onClose={() => setSnackbar({ ...snackbar, open: false })}
              severity={snackbar.severity}
              sx={{ width: '100%' }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {/* 页面标题 */}
      <Box sx={{ mb: 4, textAlign: 'center', position: 'relative', zIndex: 1 }}>
        {/* 头像 - PC端不显示，移动端显示 */}
        {avatarUrl && !isDesktop && (
          <Box
            sx={{
              mb: 3,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Box
              sx={ isWeChat ? {
                width: { xs: 100, sm: 120 },
                height: { xs: 100, sm: 120 },
                borderRadius: '50%',
                overflow: 'hidden',
                border: `4px solid`,
                borderColor: 'primary.main',
                backgroundColor: theme.palette.mode === 'dark' ? '#1a1f37' : '#ffffff',
                padding: '4px',
              } : {
                width: { xs: 100, sm: 120 },
                height: { xs: 100, sm: 120 },
                borderRadius: '50%',
                overflow: 'hidden',
                border: `4px solid`,
                borderColor: theme.palette.mode === 'dark'
                  ? 'rgba(110, 193, 228, 0.3)'
                  : 'rgba(110, 193, 228, 0.4)',
                backdropFilter: 'blur(10px)',
                backgroundColor: theme.palette.mode === 'dark'
                  ? 'rgba(20, 25, 45, 0.5)'
                  : 'rgba(255, 255, 255, 0.4)',
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
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '50%',
                }}
              />
            </Box>
          </Box>
        )}
        
        <Typography
          variant={isDesktop ? 'h3' : 'h4'}
          fontWeight={700}
          color="primary"
          sx={{ 
            mb: 1.5,
            letterSpacing: '0.02em',
          }}
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
            backdropFilter: 'blur(10px)',
            backgroundColor: theme.palette.mode === 'dark'
              ? 'rgba(110, 193, 228, 0.15)'
              : 'rgba(110, 193, 228, 0.12)',
            border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(110, 193, 228, 0.3)' : 'rgba(110, 193, 228, 0.25)'}`,
          }}
        >
          <MusicNote sx={{ fontSize: 18, color: 'primary.main' }} />
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 600,
              color: 'primary.main',
            }}
          >
            共收录 {total} 首歌曲
          </Typography>
        </Box>
      </Box>

      {/* PC端布局：左侧筛选器 + 右侧内容 */}
      {isDesktop ? (
        <Box sx={{ 
          display: 'flex', 
          gap: 3, 
          maxWidth: 1400, 
          mx: 'auto', 
          px: 3 
        }}>
          {/* 左侧筛选器（PC端）- 固定宽度 */}
          <Box sx={{ flexShrink: 0, width: 260 }}>
            <Card 
              sx={ isWeChat ? {
                position: 'sticky', 
                top: 88,
                backgroundColor: theme.palette.mode === 'dark' ? '#1a1f37' : '#ffffff',
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                boxShadow: 'none',
              } : { 
                position: 'sticky', 
                top: 88,
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                backgroundColor: theme.palette.mode === 'dark'
                  ? 'rgba(20, 25, 45, 0.7)'
                  : 'rgba(255, 255, 255, 0.7)',
                border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                borderRadius: 2,
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                  : '0 8px 32px rgba(0, 0, 0, 0.1)',
              }}
            >
              <CardContent>
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  fontWeight={600}
                  sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <FilterList sx={{ fontSize: 20 }} />
                  筛选歌曲
                </Typography>
                <FilterPanel />
              </CardContent>
            </Card>
          </Box>

          {/* 右侧歌曲列表（PC端） - 自适应宽度 */}
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Paper
              sx={ isWeChat ? {
                backgroundColor: theme.palette.mode === 'dark' ? '#1a1f37' : '#ffffff',
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                boxShadow: 'none',
              } : {
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                backgroundColor: theme.palette.mode === 'dark'
                  ? 'rgba(20, 25, 45, 0.7)'
                  : 'rgba(255, 255, 255, 0.5)',
                border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(110, 193, 228, 0.15)'}`,
                borderRadius: 2,
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                  : '0 4px 24px rgba(110, 193, 228, 0.15)',
              }}
            >
              <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                  歌曲列表
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  根据您的歌单内容
                </Typography>
              </Box>
              {loading ? (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  py: 8,
                  minHeight: '300px',
                }}>
                  <CircularProgress size={60} />
                </Box>
              ) : songs.length === 0 ? (
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '300px',
                }}>
                  <MusicNote sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    暂无歌曲
                  </Typography>
                </Box>
              ) : (
                <>
                  <Box sx={{ 
                    px: 2,
                    py: 1.5,
                  }}>
                    <List sx={{ py: 0, px: 0 }}>
                      {songs.map((song, index) => (
                        isWeChat ? (
                          <WeChatSimpleSongItem
                            key={song.id}
                            song={song}
                            onCopy={handleCopy}
                            isLast={index === songs.length - 1}
                          />
                        ) : (
                          <SongListItem
                            key={song.id}
                            song={song}
                            onCopy={handleCopy}
                            isLast={index === songs.length - 1}
                            onFilterByLanguage={handleFilterByLanguage}
                            onFilterByCategory={handleFilterByCategory}
                            onFilterByLetter={handleFilterByLetter}
                            isDesktop={isDesktop}
                            isLowPerf={isLowPerf}
                            {...songListProps}
                          />
                        )
                      ))}
                    </List>
                  </Box>

                  {totalPages > 1 && (
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      py: 2.5,
                      px: 2,
                      mt: 2,
                      borderTop: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(110, 193, 228, 0.15)'}`,
                    }}>
                      <Pagination
                        count={totalPages}
                        page={page}
                        onChange={handlePageChange}
                        color="primary"
                        size="medium"
                        showFirstButton
                        showLastButton
                      />
                    </Box>
                  )}
                </>
              )}
            </Paper>
          </Box>
        </Box>
      ) : (
        /* 移动端布局 */
        <>
          {/* 移动端搜索框和筛选按钮 */}
          <Box sx={{ mb: 3 }}>
            {/* 搜索框 */}
            <TextField
              fullWidth
              placeholder="搜索歌曲或歌手..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              size="medium"
              sx={ isWeChat ? {
                mb: 1.5,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: theme.palette.mode === 'dark' ? '#1a1f37' : '#ffffff',
                  borderRadius: 2,
                },
              } : {
                mb: 1.5,
                '& .MuiOutlinedInput-root': {
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  backgroundColor: theme.palette.mode === 'dark'
                    ? 'rgba(20, 25, 45, 0.75)'
                    : 'rgba(255, 255, 255, 0.45)',
                  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(110, 193, 228, 0.2)'}`,
                  borderRadius: 3,
                  boxShadow: theme.palette.mode === 'dark'
                    ? 'none'
                    : '0 2px 8px rgba(110, 193, 228, 0.08)',
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark'
                      ? 'rgba(20, 25, 45, 0.85)'
                      : 'rgba(255, 255, 255, 0.6)',
                    borderColor: 'primary.main',
                  },
                  '&.Mui-focused': {
                    backgroundColor: theme.palette.mode === 'dark'
                      ? 'rgba(20, 25, 45, 0.85)'
                      : 'rgba(255, 255, 255, 0.6)',
                    borderColor: 'primary.main',
                    boxShadow: theme.palette.mode === 'dark'
                      ? '0 0 0 2px rgba(110, 193, 228, 0.2)'
                      : '0 0 0 2px rgba(110, 193, 228, 0.15)',
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'primary.main' }} />
                  </InputAdornment>
                ),
              }}
            />
            {/* 筛选按钮 */}
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setMobileFilterOpen(true)}
              startIcon={<FilterList />}
              sx={{
                height: '48px',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                backgroundColor: theme.palette.mode === 'dark'
                  ? 'rgba(20, 25, 45, 0.75)'
                  : 'rgba(255, 255, 255, 0.45)',
                border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(110, 193, 228, 0.25)'}`,
                borderRadius: 3,
                fontWeight: 600,
                fontSize: '0.95rem',
                color: 'primary.main',
                boxShadow: theme.palette.mode === 'dark'
                  ? 'none'
                  : '0 2px 8px rgba(110, 193, 228, 0.08)',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark'
                    ? 'rgba(20, 25, 45, 0.85)'
                    : 'rgba(255, 255, 255, 0.6)',
                  borderColor: 'primary.main',
                  transform: 'translateY(-2px)',
                  boxShadow: theme.palette.mode === 'dark'
                    ? '0 4px 12px rgba(0, 0, 0, 0.3)'
                    : '0 4px 16px rgba(110, 193, 228, 0.2)',
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              筛选
            </Button>
          </Box>

          {/* 移动端筛选抽屉 */}
          <Drawer
            anchor="bottom"
            open={mobileFilterOpen}
            onClose={() => setMobileFilterOpen(false)}
            PaperProps={{
              sx: {
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                maxHeight: '80vh',
                backdropFilter: 'blur(20px) saturate(180%)',
                backgroundColor: theme.palette.mode === 'dark'
                  ? 'rgba(20, 25, 45, 0.95)'
                  : 'rgba(255, 255, 255, 0.95)',
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 -4px 24px rgba(0, 0, 0, 0.5)'
                  : '0 -4px 24px rgba(110, 193, 228, 0.2)',
              },
            }}
          >
            <Box sx={{ p: 3 }}>
              {/* 抽屉顶部指示器 */}
              <Box
                sx={{
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.2)'
                    : 'rgba(110, 193, 228, 0.3)',
                  mx: 'auto',
                  mb: 2,
                }}
              />
              <Typography 
                variant="h6" 
                gutterBottom 
                fontWeight={700}
                color="primary"
                sx={{ mb: 2 }}
              >
                筛选条件
              </Typography>
              <FilterPanel />
              <Button
                fullWidth
                variant="contained"
                size="large"
                sx={{ 
                  mt: 3,
                  py: 1.5,
                  borderRadius: 3,
                  fontWeight: 700,
                  fontSize: '1rem',
                  boxShadow: theme.palette.mode === 'dark'
                    ? '0 4px 16px rgba(110, 193, 228, 0.3)'
                    : '0 4px 16px rgba(110, 193, 228, 0.25)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.palette.mode === 'dark'
                      ? '0 6px 24px rgba(110, 193, 228, 0.4)'
                      : '0 6px 24px rgba(110, 193, 228, 0.35)',
                  },
                  transition: 'all 0.3s ease',
                }}
                onClick={() => setMobileFilterOpen(false)}
              >
                确定
              </Button>
            </Box>
          </Drawer>

          {/* 歌曲列表（移动端） - 列表形式 */}
          <Paper
            sx={ isWeChat ? {
              backgroundColor: theme.palette.mode === 'dark' ? '#1a1f37' : '#ffffff',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              boxShadow: 'none',
              overflow: 'hidden',
            } : {
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              backgroundColor: theme.palette.mode === 'dark'
                ? 'rgba(20, 25, 45, 0.75)'
                : 'rgba(255, 255, 255, 0.45)',
              border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(110, 193, 228, 0.15)'}`,
              borderRadius: 3,
              boxShadow: theme.palette.mode === 'dark'
                ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                : '0 4px 24px rgba(110, 193, 228, 0.15)',
              overflow: 'hidden',
            }}
          >
            {loading ? (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                py: 8,
                minHeight: '300px',
              }}>
                <CircularProgress size={50} />
              </Box>
            ) : songs.length === 0 ? (
              <Box sx={{ 
                textAlign: 'center', 
                py: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '300px',
              }}>
                <MusicNote sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  暂无歌曲
                </Typography>
              </Box>
            ) : (
              <>
                <List sx={{ py: 1.5, px: 1 }}>
                  {songs.map((song, index) => (
                    isWeChat ? (
                      <WeChatSimpleSongItem
                        key={song.id}
                        song={song}
                        onCopy={handleCopy}
                        isLast={index === songs.length - 1}
                      />
                    ) : (
                      <SongListItem
                        key={song.id}
                        song={song}
                        onCopy={handleCopy}
                        isLast={index === songs.length - 1}
                        onFilterByLanguage={handleFilterByLanguage}
                        onFilterByCategory={handleFilterByCategory}
                        onFilterByLetter={handleFilterByLetter}
                        isDesktop={isDesktop}
                        isLowPerf={isLowPerf}
                        {...songListProps}
                      />
                    )
                  ))}
                </List>

                {totalPages > 1 && (
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    py: 2.5,
                    borderTop: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(110, 193, 228, 0.15)'}`,
                    backdropFilter: 'blur(10px)',
                    backgroundColor: theme.palette.mode === 'dark'
                      ? 'rgba(20, 25, 45, 0.3)'
                      : 'rgba(255, 255, 255, 0.3)',
                  }}>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={handlePageChange}
                      color="primary"
                      size="medium"
                      showFirstButton
                      showLastButton
                      sx={{
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
                      }}
                    />
                  </Box>
                )}
              </>
            )}
          </Paper>
        </>
      )}

      {/* 提示消息 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{
          top: { xs: 72, sm: 80 }, // 在导航栏下方
          zIndex: 1300, // 高于AppBar(1100)
        }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// 微信极简版歌曲列表项 - 性能优化
const WeChatSimpleSongItem = React.memo(function WeChatSimpleSongItem({ song, onCopy, isLast }) {
  return (
    <Box
      sx={{
        py: 1.5,
        px: 2,
        borderBottom: isLast ? 'none' : '1px solid rgba(0, 0, 0, 0.08)',
        '&:active': {
          backgroundColor: 'rgba(110, 193, 228, 0.08)',
        },
      }}
    >
      {/* 歌曲名 */}
      <Typography
        variant="body1"
        onClick={() => onCopy(song.songName)}
        sx={{
          cursor: 'pointer',
          fontWeight: 600,
          mb: 0.5,
          color: song.isNewSong ? 'primary.main' : 'text.primary',
        }}
      >
        {song.songName}
      </Typography>

      {/* 歌手 */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
        {song.singer}
      </Typography>

      {/* 标签 */}
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
        {song.language && (
          <Chip label={song.language} size="small" variant="outlined" />
        )}
        {(song.categories || []).map((cat, idx) => (
          <Chip key={idx} label={cat} size="small" variant="outlined" />
        ))}
        {song.special && (
          <Chip label="特殊" size="small" color="secondary" variant="outlined" />
        )}
        {song.isNewSong && (
          <Chip label="NEW" size="small" color="primary" />
        )}
      </Box>
    </Box>
  );
});

// 歌曲列表项组件 - 使用 React.memo 优化性能
const SongListItem = React.memo(function SongListItem({ 
  song, 
  onCopy, 
  isLast, 
  theme, 
  isDesktop,
  onFilterByLanguage,
  onFilterByCategory,
  onFilterByLetter,
  isLowPerf
}) {
  const isDark = theme?.palette.mode === 'dark';
  const isNewSong = song.isNewSong || false;
  
  // PC端：横向布局
  if (isDesktop) {
    // 根据性能环境优化背景样式
    const backdropStyle = isLowPerf 
      ? {
          backgroundColor: isNewSong
            ? (isDark ? 'rgba(110, 193, 228, 0.25)' : 'rgba(110, 193, 228, 0.18)')
            : (isDark ? 'rgba(30, 35, 55, 0.9)' : 'rgba(255, 255, 255, 0.9)'),
        }
      : {
          backdropFilter: 'blur(10px)',
          backgroundColor: isNewSong
            ? (isDark ? 'rgba(110, 193, 228, 0.15)' : 'rgba(110, 193, 228, 0.08)')
            : (isDark ? 'rgba(30, 35, 55, 0.5)' : 'rgba(255, 255, 255, 0.5)'),
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
          ...backdropStyle,
          border: isNewSong
            ? `2px solid ${isDark ? 'rgba(110, 193, 228, 0.5)' : 'rgba(110, 193, 228, 0.4)'}`
            : `1px solid ${theme.palette.divider}`,
          boxShadow: isNewSong
            ? (isDark
              ? '0 0 20px rgba(110, 193, 228, 0.3)'
              : '0 0 20px rgba(110, 193, 228, 0.2)')
            : 'none',
          '&:hover': {
            backgroundColor: isNewSong
              ? (isDark
                ? 'rgba(110, 193, 228, 0.25)'
                : 'rgba(110, 193, 228, 0.15)')
              : (isDark
                ? 'rgba(40, 45, 65, 0.6)'
                : 'rgba(255, 255, 255, 0.7)'),
            '& .copy-icon': {
              opacity: 1,
            },
          },
          transition: 'all 0.3s ease',
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          width: '100%',
          gap: 2,
        }}>
          {/* 歌曲名称 */}
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
                  '&:hover': {
                    color: 'primary.main',
                  },
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {song.songName}
              </Typography>
            </Tooltip>
            <IconButton
              size="small"
              className="copy-icon"
              onClick={() => onCopy(song.songName)}
              sx={{
                opacity: 0,
                transition: 'opacity 0.2s',
                width: 28,
                height: 28,
              }}
            >
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
                  '@keyframes bounce': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-3px)' },
                  },
                  '& .MuiChip-label': {
                    px: 1,
                  },
                }}
              />
            )}
          </Box>

          {/* 歌手 */}
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              fontSize: '0.875rem',
              minWidth: 120,
              flexShrink: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {song.singer}
          </Typography>

          {/* 标签区域 */}
          <Stack 
            direction="row" 
            spacing={0.75} 
            alignItems="center"
            sx={{ flexGrow: 1, minWidth: 0 }}
          >
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
                  '&:hover': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    borderColor: 'primary.main',
                  },
                  transition: 'all 0.2s',
                  '& .MuiChip-label': {
                    px: 1,
                  },
                }}
              />
            </Tooltip>
            {/* 分类标签（支持多标签） */}
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
                    '&:hover': {
                      backgroundColor: 'secondary.main',
                      color: 'white',
                      borderColor: 'secondary.main',
                    },
                    transition: 'all 0.2s',
                    '& .MuiChip-label': {
                      px: 1,
                    },
                  }}
                />
              </Tooltip>
            ))}
            {song.special && (
              <Chip
                label="特殊"
                color="secondary"
                size="small"
                sx={{ 
                  height: 24, 
                  fontSize: '0.75rem',
                  '& .MuiChip-label': {
                    px: 1,
                  },
                }}
              />
            )}
          </Stack>
          
          {/* B站切片链接 */}
          {song.bilibiliClipUrl && (
            <Tooltip title="观看B站切片">
              <IconButton
                size="small"
                onClick={() => window.open(song.bilibiliClipUrl, '_blank')}
                sx={{
                  color: '#00A1D6', // B站品牌色
                  ml: 'auto',
                  flexShrink: 0,
                  '&:hover': {
                    backgroundColor: 'rgba(0, 161, 214, 0.1)',
                    transform: 'scale(1.1)',
                  },
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
  // 根据性能环境优化移动端背景样式
  const mobileBackdropStyle = isLowPerf
    ? {
        backgroundColor: isNewSong
          ? (isDark ? 'rgba(110, 193, 228, 0.3)' : 'rgba(110, 193, 228, 0.22)')
          : (isDark ? 'rgba(30, 35, 55, 0.95)' : 'rgba(255, 255, 255, 0.9)'),
      }
    : {
        backdropFilter: 'blur(15px) saturate(150%)',
        WebkitBackdropFilter: 'blur(15px) saturate(150%)',
        backgroundColor: isNewSong
          ? (isDark ? 'rgba(110, 193, 228, 0.2)' : 'rgba(110, 193, 228, 0.12)')
          : (isDark ? 'rgba(30, 35, 55, 0.6)' : 'rgba(255, 255, 255, 0.4)'),
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
        ...mobileBackdropStyle,
        border: isNewSong
          ? `2px solid ${isDark ? 'rgba(110, 193, 228, 0.6)' : 'rgba(110, 193, 228, 0.5)'}`
          : `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(110, 193, 228, 0.2)'}`,
        boxShadow: isNewSong
          ? (isDark
            ? '0 4px 20px rgba(110, 193, 228, 0.4)'
            : '0 4px 20px rgba(110, 193, 228, 0.25)')
          : (isDark
            ? '0 2px 8px rgba(0, 0, 0, 0.2)'
            : '0 2px 12px rgba(110, 193, 228, 0.12)'),
        '&:hover': {
          backgroundColor: isNewSong
            ? (isDark
              ? 'rgba(110, 193, 228, 0.3)'
              : 'rgba(110, 193, 228, 0.18)')
            : (isDark
              ? 'rgba(40, 45, 65, 0.7)'
              : 'rgba(255, 255, 255, 0.55)'),
          transform: 'translateY(-2px)',
          boxShadow: isNewSong
            ? (isDark
              ? '0 6px 28px rgba(110, 193, 228, 0.5)'
              : '0 6px 28px rgba(110, 193, 228, 0.35)')
            : (isDark
              ? '0 4px 16px rgba(0, 0, 0, 0.3)'
              : '0 4px 20px rgba(110, 193, 228, 0.2)'),
          '& .copy-icon': {
            opacity: 1,
          },
        },
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
        <ListItemText
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
                    '&:hover': {
                      color: 'primary.main',
                    },
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
                    '@keyframes bounce': {
                      '0%, 100%': { transform: 'translateY(0)' },
                      '50%': { transform: 'translateY(-3px)' },
                    },
                    '& .MuiChip-label': {
                      px: 0.75,
                    },
                  }}
                />
              )}
              <IconButton
                size="small"
                className="copy-icon"
                onClick={() => onCopy(song.songName)}
                sx={{
                  opacity: 0,
                  transition: 'opacity 0.2s',
                  width: 28,
                  height: 28,
                  ml: 0.5,
                }}
              >
                <ContentCopy fontSize="small" />
              </IconButton>
              {song.special && (
                <Chip
                  label="特殊"
                  color="secondary"
                  size="small"
                  sx={{ 
                    height: 20, 
                    fontSize: '0.65rem',
                    '& .MuiChip-label': {
                      px: 0.75,
                    },
                  }}
                />
              )}
              {/* B站切片链接（移动端） */}
              {song.bilibiliClipUrl && (
                <Tooltip title="观看B站切片">
                  <IconButton
                    size="small"
                    onClick={() => window.open(song.bilibiliClipUrl, '_blank')}
                    sx={{
                      color: '#00A1D6',
                      width: 28,
                      height: 28,
                      '&:hover': {
                        backgroundColor: 'rgba(0, 161, 214, 0.1)',
                      },
                    }}
                  >
                    <PlayCircleOutline fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          }
          secondary={
            <Stack 
              direction="row" 
              spacing={0.75} 
              alignItems="center" 
              flexWrap="wrap" 
              useFlexGap
              sx={{ mt: 0.25 }}
            >
              <Typography 
                variant="body2" 
                sx={{ 
                  fontSize: { xs: '0.85rem', sm: '0.9rem' },
                  color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(42, 63, 95, 0.7)',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  '&::before': {
                    content: '"♪"',
                    marginRight: '6px',
                    color: 'primary.main',
                    fontSize: '0.9rem',
                  },
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
                    '& .MuiChip-label': {
                      px: 1,
                    },
                  }}
                />
              </Tooltip>
              {/* 分类标签（支持多标签） */}
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
                      '& .MuiChip-label': {
                        px: 1,
                      },
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

export default HomePage;

