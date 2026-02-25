import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Snackbar,
  Alert,
  Drawer,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { FilterList } from '@mui/icons-material';
import { playlistAPI } from '../services/api';
import { debounce, copyToClipboard } from '../utils/helpers';
import { useSearch } from '../components/AppLayout';
import FilterPanel from '../components/FilterPanel';
import HomePageHeader from '../components/HomePageHeader';
import SongListPanel from '../components/SongListPanel';
import MobileSearchBar from '../components/MobileSearchBar';
import { getCachedImage, cacheImage } from '../utils/imageCache';

function HomePage({ siteConfig }) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const isDark = theme.palette.mode === 'dark';

  // 筛选 Card：静态容器，直接使用 backdrop-filter 无滚动
  const cardPanelStyle = React.useMemo(
    () => ({
      backdropFilter: 'blur(14px) saturate(150%)',
      WebkitBackdropFilter: 'blur(14px) saturate(150%)',
      backgroundColor: isDark ? 'rgba(20, 25, 45, 0.75)' : 'rgba(255, 255, 255, 0.85)',
      border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
      borderRadius: 2,
      boxShadow: isDark ? '0 8px 32px rgba(0, 0, 0, 0.2)' : '0 8px 32px rgba(0, 0, 0, 0.06)',
    }),
    [isDark]
  );

  // 列表 Paper：模糊层与滚动内容分离，避免滚动时 backdrop-filter 每帧重算（Chrome 已知问题）
  const paperListBaseStyle = React.useMemo(
    () => ({
      position: 'relative',
      overflow: 'hidden',
      isolation: 'isolate', // 创建堆叠上下文，利于模糊层合成
      border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(110, 193, 228, 0.15)'}`,
      borderRadius: 2,
      boxShadow: isDark ? '0 8px 32px rgba(0, 0, 0, 0.2)' : '0 4px 24px rgba(110, 193, 228, 0.1)',
    }),
    [isDark]
  );

  // 列表模糊层：单层模糊覆盖整块，避免逐项 blur 带来的性能损耗
  const paperListBlurLayerStyle = React.useMemo(
    () => ({
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 0,
      backdropFilter: 'blur(16px) saturate(165%)',
      WebkitBackdropFilter: 'blur(16px) saturate(165%)',
      backgroundColor: isDark ? 'rgba(20, 25, 45, 0.72)' : 'rgba(255, 255, 255, 0.6)',
    }),
    [isDark]
  );

  const paperListStyleMobile = React.useMemo(
    () => ({
      ...paperListBaseStyle,
      borderRadius: 3,
    }),
    [paperListBaseStyle]
  );
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(siteConfig?.avatarUrl || '');
  
  // 从Context获取搜索文本
  const { searchText, setSearchText } = useSearch();
  
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
  }, []);

  // 加载歌单（带防抖）
  useEffect(() => {
    const debouncedLoad = debounce(loadPlaylist, 300);
    debouncedLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    page, 
    searchText, 
    selectedLetter, 
    selectedLanguages.join(','), // 转为字符串避免数组引用问题
    selectedCategories.join(','), // 转为字符串避免数组引用问题
    selectedSpecial
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

  // 首字母 Chip 点击：选中则取消，未选中则选中
  const handleLetterChipClick = useCallback((letter) => {
    setSelectedLetter((prev) => (prev === letter ? null : letter));
    setPage(1);
  }, []);

  // 特殊歌曲 Chip 点击：切换
  const handleSpecialChipClick = useCallback(() => {
    setSelectedSpecial((prev) => (prev === true ? null : true));
    setPage(1);
  }, []);

  // FilterPanel 用的 props（稳定引用，供 memo 比较）
  const filterPanelProps = React.useMemo(
    () => ({
      firstLetters,
      languages,
      categories,
      hasXiqu,
      selectedLetter,
      selectedLanguages,
      selectedCategories,
      selectedSpecial,
      onLetterChange: handleLetterChipClick,
      onLanguageToggle: handleFilterByLanguage,
      onCategoryToggle: handleFilterByCategory,
      onSpecialToggle: handleSpecialChipClick,
      onClear: clearFilters,
      theme,
    }),
    [
      firstLetters,
      languages,
      categories,
      hasXiqu,
      selectedLetter,
      selectedLanguages,
      selectedCategories,
      selectedSpecial,
      handleLetterChipClick,
      handleFilterByLanguage,
      handleFilterByCategory,
      handleSpecialChipClick,
      clearFilters,
      theme,
    ]
  );

  return (
    <Box>
      <HomePageHeader
        avatarUrl={avatarUrl}
        siteConfig={siteConfig}
        isDesktop={isDesktop}
        total={total}
        theme={theme}
      />

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
              sx={{ position: 'sticky', top: 88, ...cardPanelStyle }}
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
                <FilterPanel {...filterPanelProps} />
              </CardContent>
            </Card>
          </Box>

          {/* 右侧歌曲列表（PC端） - 自适应宽度 */}
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <SongListPanel
              loading={loading}
              songs={songs}
              totalPages={totalPages}
              page={page}
              onPageChange={handlePageChange}
              onCopy={handleCopy}
              onFilterByLanguage={handleFilterByLanguage}
              onFilterByCategory={handleFilterByCategory}
              onFilterByLetter={handleFilterByLetter}
              isDesktop={true}
              theme={theme}
              paperListBaseStyle={paperListBaseStyle}
              paperListBlurLayerStyle={paperListBlurLayerStyle}
              paperListStyleMobile={paperListStyleMobile}
              showHeader={true}
            />
          </Box>
        </Box>
      ) : (
        /* 移动端布局 */
        <>
          <MobileSearchBar
            searchText={searchText}
            onSearchChange={setSearchText}
            onFilterClick={() => setMobileFilterOpen(true)}
            theme={theme}
          />

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
              <FilterPanel {...filterPanelProps} />
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

          {/* 歌曲列表（移动端） */}
          <SongListPanel
            loading={loading}
            songs={songs}
            totalPages={totalPages}
            page={page}
            onPageChange={handlePageChange}
            onCopy={handleCopy}
            onFilterByLanguage={handleFilterByLanguage}
            onFilterByCategory={handleFilterByCategory}
            onFilterByLetter={handleFilterByLetter}
            isDesktop={false}
            theme={theme}
            paperListBaseStyle={paperListBaseStyle}
            paperListBlurLayerStyle={paperListBlurLayerStyle}
            paperListStyleMobile={paperListStyleMobile}
            showHeader={false}
          />
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

export default HomePage;

