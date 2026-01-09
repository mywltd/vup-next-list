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
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { Search, ContentCopy, MusicNote, FilterList, Language, Category, Star, Refresh } from '@mui/icons-material';
import { playlistAPI } from '../services/api';
import { debounce, copyToClipboard, getLetterColor } from '../utils/helpers';
import { useSearch } from '../components/AppLayout';
import { getCachedImage, cacheImage } from '../utils/imageCache';

function HomePage({ siteConfig }) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(siteConfig?.avatarUrl || '');
  
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
      const cached = getCachedImage(siteConfig.avatarUrl);
      if (cached) {
        setAvatarUrl(cached);
      } else {
        setAvatarUrl(siteConfig.avatarUrl);
        cacheImage(siteConfig.avatarUrl).then(cachedUrl => {
          if (cachedUrl) {
            setAvatarUrl(cachedUrl);
          }
        });
      }
    }
  }, [siteConfig?.avatarUrl]);
  
  // 可用的筛选选项
  const [languages, setLanguages] = useState([]);
  const [firstLetters, setFirstLetters] = useState([]);
  
  // 固定的种类选项（根据图片描述）
  const categories = ['流行', '摇滚', '古典', '电子', '嘻哈'];
  
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
      // 如果选择了语言，使用第一个（保持向后兼容）
      if (selectedLanguages.length > 0) {
        params.language = selectedLanguages[0];
      }
      if (selectedSpecial !== null) params.special = selectedSpecial;
      
      const data = await playlistAPI.getPlaylist(params);
      setSongs(data.songs);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (error) {
      console.error('加载歌单失败:', error);
      showSnackbar('加载歌单失败', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, searchText, selectedLetter, selectedLanguages, selectedSpecial]);

  // 加载筛选选项
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [languagesData, lettersData] = await Promise.all([
          playlistAPI.getLanguages(),
          playlistAPI.getFirstLetters(),
        ]);
        setLanguages(languagesData.languages);
        setFirstLetters(lettersData.firstLetters);
      } catch (error) {
        console.error('加载筛选选项失败:', error);
      }
    };
    loadFilters();
  }, []);

  // 加载歌单（带防抖）
  useEffect(() => {
    const debouncedLoad = debounce(loadPlaylist, 300);
    debouncedLoad();
  }, [loadPlaylist]);

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopy = async (songName) => {
    const success = await copyToClipboard(songName);
    if (success) {
      showSnackbar(`已复制: ${songName}`, 'success');
    } else {
      showSnackbar('复制失败', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const clearFilters = () => {
    setSearchText('');
    setSelectedLetter(null);
    setSelectedLanguages([]);
    setSelectedCategories([]);
    setSelectedSpecial(null);
    setPage(1);
  };

  // 处理语言复选框变化
  const handleLanguageChange = (lang) => (event) => {
    if (event.target.checked) {
      setSelectedLanguages([...selectedLanguages, lang]);
    } else {
      setSelectedLanguages(selectedLanguages.filter(l => l !== lang));
    }
  };

  // 处理种类复选框变化
  const handleCategoryChange = (category) => (event) => {
    if (event.target.checked) {
      setSelectedCategories([...selectedCategories, category]);
    } else {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    }
  };

  // 筛选器组件
  const FilterPanel = () => (
    <Box>
      {/* 语言筛选 */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Language sx={{ fontSize: 20, color: 'text.secondary' }} />
          <Typography variant="subtitle2" fontWeight={600}>
            语言
          </Typography>
        </Box>
        <Stack spacing={0.5}>
          {languages.map((lang) => (
            <FormControlLabel
              key={lang}
              control={
                <Checkbox
                  checked={selectedLanguages.includes(lang)}
                  onChange={handleLanguageChange(lang)}
                  size="small"
                  sx={{
                    color: 'primary.main',
                    '&.Mui-checked': {
                      color: 'primary.main',
                    },
                  }}
                />
              }
              label={lang}
              sx={{
                '& .MuiFormControlLabel-label': {
                  fontSize: '0.875rem',
                },
              }}
            />
          ))}
        </Stack>
      </Box>

      {/* 种类筛选 */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Category sx={{ fontSize: 20, color: 'text.secondary' }} />
          <Typography variant="subtitle2" fontWeight={600}>
            种类
          </Typography>
        </Box>
        <Stack spacing={0.5}>
          {categories.map((category) => (
            <FormControlLabel
              key={category}
              control={
                <Checkbox
                  checked={selectedCategories.includes(category)}
                  onChange={handleCategoryChange(category)}
                  size="small"
                  sx={{
                    color: 'primary.main',
                    '&.Mui-checked': {
                      color: 'primary.main',
                    },
                  }}
                />
              }
              label={category}
              sx={{
                '& .MuiFormControlLabel-label': {
                  fontSize: '0.875rem',
                },
              }}
            />
          ))}
        </Stack>
      </Box>

      {/* 特殊歌曲筛选 */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Star sx={{ fontSize: 20, color: 'text.secondary' }} />
          <Typography variant="subtitle2" fontWeight={600}>
            特殊歌曲
          </Typography>
        </Box>
        <FormControlLabel
          control={
            <Checkbox
              checked={selectedSpecial === true}
              onChange={(e) => setSelectedSpecial(e.target.checked ? true : null)}
              size="small"
              sx={{
                color: 'primary.main',
                '&.Mui-checked': {
                  color: 'primary.main',
                },
              }}
            />
          }
          label="仅显示特殊歌曲"
          sx={{
            '& .MuiFormControlLabel-label': {
              fontSize: '0.875rem',
            },
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

  return (
    <Box>
      {/* 页面标题 */}
      <Box sx={{ mb: 4, textAlign: 'center', position: 'relative', zIndex: 1 }}>
        {/* 头像 - PC端不显示，移动端显示 */}
        {avatarUrl && !isDesktop && (
          <Box
            sx={{
              mb: 2,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Box
              sx={{
                width: { xs: 80, sm: 100 },
                height: { xs: 80, sm: 100 },
                borderRadius: '50%',
                overflow: 'hidden',
                border: `3px solid ${theme.palette.divider}`,
                backdropFilter: 'blur(10px)',
                backgroundColor: theme.palette.mode === 'dark'
                  ? 'rgba(20, 25, 45, 0.5)'
                  : 'rgba(255, 255, 255, 0.5)',
                padding: '3px',
              }}
            >
              <Box
                component="img"
                src={avatarUrl}
                alt="头像"
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
          fontWeight={600}
          color="primary"
          sx={{ mb: 1 }}
        >
          {siteConfig?.defaultPlaylistName || '歌单'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          共收录 {total} 首歌曲
        </Typography>
      </Box>

      {/* PC端布局：左侧筛选器 + 右侧内容 */}
      {isDesktop ? (
        <Box sx={{ display: 'flex', gap: 2, px: 3 }}>
          {/* 左侧筛选器（PC端）- 固定宽度 */}
          <Box sx={{ flexShrink: 0, width: 280 }}>
            <Card 
              sx={{ 
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
              sx={{
                display: 'flex',
                flexDirection: 'column',
                height: 'fit-content',
                maxHeight: 'calc(100vh - 180px)',
                overflow: 'hidden',
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
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    flex: 1,
                    maxHeight: totalPages > 1 ? 'calc(100vh - 260px)' : 'calc(100vh - 220px)',
                    px: 2,
                    py: 1.5,
                  }}>
                    <List sx={{ py: 0, px: 0 }}>
                      {songs.map((song, index) => (
                        <SongListItem
                          key={song.id}
                          song={song}
                          onCopy={handleCopy}
                          isLast={index === songs.length - 1}
                          onFilterByLanguage={(lang) => {
                            setSelectedLanguages([lang]);
                            setPage(1);
                          }}
                          onFilterByCategory={(cat) => {
                            setSelectedCategories([cat]);
                            setPage(1);
                          }}
                          onFilterByLetter={(letter) => {
                            setSelectedLetter(letter);
                            setPage(1);
                          }}
                          isDesktop={isDesktop}
                          {...songListProps}
                        />
                      ))}
                    </List>
                  </Box>

                  {totalPages > 1 && (
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      py: 2,
                      px: 2,
                      borderTop: 1,
                      borderColor: 'divider',
                      flexShrink: 0,
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
              size="small"
              sx={{
                mb: 1.5,
                '& .MuiOutlinedInput-root': {
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  backgroundColor: theme.palette.mode === 'dark'
                    ? 'rgba(20, 25, 45, 0.7)'
                    : 'rgba(255, 255, 255, 0.7)',
                  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark'
                      ? 'rgba(20, 25, 45, 0.8)'
                      : 'rgba(255, 255, 255, 0.8)',
                  },
                  '&.Mui-focused': {
                    backgroundColor: theme.palette.mode === 'dark'
                      ? 'rgba(20, 25, 45, 0.8)'
                      : 'rgba(255, 255, 255, 0.8)',
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />
            {/* 筛选按钮 - 与搜索框左右对齐，高度一致 */}
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setMobileFilterOpen(true)}
              startIcon={<FilterList />}
              sx={{
                height: '40px', // 与TextField高度一致
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                backgroundColor: theme.palette.mode === 'dark'
                  ? 'rgba(20, 25, 45, 0.7)'
                  : 'rgba(255, 255, 255, 0.7)',
                border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark'
                    ? 'rgba(20, 25, 45, 0.8)'
                    : 'rgba(255, 255, 255, 0.8)',
                  borderColor: 'primary.main',
                },
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
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                maxHeight: '80vh',
              },
            }}
          >
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                筛选条件
              </Typography>
              <FilterPanel />
              <Button
                fullWidth
                variant="contained"
                sx={{ mt: 2 }}
                onClick={() => setMobileFilterOpen(false)}
              >
                确定
              </Button>
            </Box>
          </Drawer>

          {/* 歌曲列表（移动端） - 列表形式 */}
          <Paper
            sx={{
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
                    <SongListItem
                      key={song.id}
                      song={song}
                      onCopy={handleCopy}
                      isLast={index === songs.length - 1}
                      onFilterByLanguage={(lang) => {
                        setSelectedLanguages([lang]);
                        setPage(1);
                      }}
                      onFilterByCategory={(cat) => {
                        setSelectedCategories([cat]);
                        setPage(1);
                      }}
                      onFilterByLetter={(letter) => {
                        setSelectedLetter(letter);
                        setPage(1);
                      }}
                      isDesktop={isDesktop}
                      {...songListProps}
                    />
                  ))}
                </List>

                {totalPages > 1 && (
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    py: 2,
                    borderTop: 1,
                    borderColor: 'divider',
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
        </>
      )}

      {/* 提示消息 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// 歌曲列表项组件
function SongListItem({ 
  song, 
  onCopy, 
  isLast, 
  theme, 
  isDesktop,
  onFilterByLanguage,
  onFilterByCategory,
  onFilterByLetter
}) {
  const isDark = theme?.palette.mode === 'dark';
  
  // PC端：横向布局
  if (isDesktop) {
    return (
      <ListItem
        component="div"
        sx={{
          py: 1.5,
          px: 2.5,
          mb: 1,
          mx: 1,
          borderRadius: 2,
          backdropFilter: 'blur(10px)',
          backgroundColor: isDark
            ? 'rgba(30, 35, 55, 0.5)'
            : 'rgba(255, 255, 255, 0.5)',
          border: `1px solid ${theme.palette.divider}`,
          '&:hover': {
            backgroundColor: isDark
              ? 'rgba(40, 45, 65, 0.6)'
              : 'rgba(255, 255, 255, 0.7)',
            '& .copy-icon': {
              opacity: 1,
            },
          },
          transition: 'background-color 0.2s',
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
                fontWeight={600}
                onClick={() => onCopy(song.songName)}
                sx={{
                  cursor: 'pointer',
                  fontSize: '1rem',
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
            <Tooltip title="点击筛选此种类">
              <Chip
                label={song.category}
                size="small"
                variant="outlined"
                onClick={() => onFilterByCategory(song.category)}
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
            <Tooltip title="点击筛选此首字母">
              <Chip
                label={song.firstLetter}
                size="small"
                color="primary"
                variant="outlined"
                onClick={() => onFilterByLetter(song.firstLetter)}
                sx={{
                  height: 24,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                  },
                  transition: 'all 0.2s',
                  '& .MuiChip-label': {
                    px: 1,
                  },
                }}
              />
            </Tooltip>
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
        </Box>
      </ListItem>
    );
  }
  
  // 移动端：垂直布局
  return (
    <ListItem
      component="div"
      sx={{
        py: 1.5,
        px: { xs: 2, sm: 2.5 },
        mb: 1,
        mx: { xs: 0.5, sm: 1 },
        borderRadius: 2,
        backdropFilter: 'blur(10px)',
        backgroundColor: isDark
          ? 'rgba(30, 35, 55, 0.5)'
          : 'rgba(255, 255, 255, 0.5)',
        border: `1px solid ${theme.palette.divider}`,
        '&:hover': {
          backgroundColor: isDark
            ? 'rgba(40, 45, 65, 0.6)'
            : 'rgba(255, 255, 255, 0.7)',
          '& .copy-icon': {
            opacity: 1,
          },
        },
        transition: 'background-color 0.2s',
      }}
    >
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
              <Tooltip title="点击复制歌曲名">
                <Typography
                  variant="body1"
                  fontWeight={600}
                  onClick={() => onCopy(song.songName)}
                  sx={{
                    flexGrow: 1,
                    cursor: 'pointer',
                    fontSize: { xs: '0.95rem', sm: '1rem' },
                    '&:hover': {
                      color: 'primary.main',
                    },
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
                color="text.secondary"
                sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
              >
                {song.singer}
              </Typography>
              <Tooltip title="点击筛选此语言">
                <Chip
                  label={song.language}
                  size="small"
                  variant="outlined"
                  onClick={() => onFilterByLanguage(song.language)}
                  sx={{ 
                    height: 20, 
                    fontSize: '0.65rem',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                      borderColor: 'primary.main',
                    },
                    '& .MuiChip-label': {
                      px: 0.75,
                    },
                  }}
                />
              </Tooltip>
              <Tooltip title="点击筛选此种类">
                <Chip
                  label={song.category}
                  size="small"
                  variant="outlined"
                  onClick={() => onFilterByCategory(song.category)}
                  sx={{ 
                    height: 20, 
                    fontSize: '0.65rem',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'secondary.main',
                      color: 'white',
                      borderColor: 'secondary.main',
                    },
                    '& .MuiChip-label': {
                      px: 0.75,
                    },
                  }}
                />
              </Tooltip>
              <Tooltip title="点击筛选此首字母">
                <Chip
                  label={song.firstLetter}
                  size="small"
                  color="primary"
                  variant="outlined"
                  onClick={() => onFilterByLetter(song.firstLetter)}
                  sx={{
                    height: 20,
                    fontSize: '0.65rem',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                    },
                    '& .MuiChip-label': {
                      px: 0.75,
                    },
                  }}
                />
              </Tooltip>
            </Stack>
          }
        />
      </ListItem>
  );
}

export default HomePage;

