import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
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
import { Search, ContentCopy, MusicNote, FilterList } from '@mui/icons-material';
import { playlistAPI } from '../services/api';
import { debounce, copyToClipboard, getLetterColor } from '../utils/helpers';

function HomePage({ siteConfig }) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  
  // 将theme传递给子组件
  const songListProps = { theme };
  
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  // 筛选条件
  const [searchText, setSearchText] = useState('');
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [selectedSpecial, setSelectedSpecial] = useState(null);
  
  // 可用的筛选选项
  const [languages, setLanguages] = useState([]);
  const [firstLetters, setFirstLetters] = useState([]);
  
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
      if (selectedLanguage) params.language = selectedLanguage;
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
  }, [page, searchText, selectedLetter, selectedLanguage, selectedSpecial]);

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
    setSelectedLanguage(null);
    setSelectedSpecial(null);
    setPage(1);
  };

  // 筛选器组件
  const FilterPanel = () => (
    <Box>
      {/* 首字母筛选 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom fontWeight={600}>
          按首字母筛选
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip
            label="全部"
            onClick={() => setSelectedLetter(null)}
            color={selectedLetter === null ? 'primary' : 'default'}
            sx={{ mb: 1 }}
            size="small"
          />
          {firstLetters.map((letter) => (
            <Chip
              key={letter}
              label={letter}
              onClick={() => setSelectedLetter(letter)}
              color={selectedLetter === letter ? 'primary' : 'default'}
              size="small"
              sx={{ mb: 1 }}
            />
          ))}
        </Stack>
      </Box>

      {/* 语种筛选 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom fontWeight={600}>
          按语种筛选
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip
            label="全部"
            onClick={() => setSelectedLanguage(null)}
            color={selectedLanguage === null ? 'primary' : 'default'}
            sx={{ mb: 1 }}
            size="small"
          />
          {languages.map((lang) => (
            <Chip
              key={lang}
              label={lang}
              onClick={() => setSelectedLanguage(lang)}
              color={selectedLanguage === lang ? 'primary' : 'default'}
              sx={{ mb: 1 }}
              size="small"
            />
          ))}
        </Stack>
      </Box>

      {/* 特殊歌曲筛选 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom fontWeight={600}>
          特殊歌曲
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip
            label="全部"
            onClick={() => setSelectedSpecial(null)}
            color={selectedSpecial === null ? 'primary' : 'default'}
            size="small"
          />
          <Chip
            label="特殊歌曲"
            onClick={() => setSelectedSpecial(true)}
            color={selectedSpecial === true ? 'secondary' : 'default'}
            size="small"
          />
          <Chip
            label="普通歌曲"
            onClick={() => setSelectedSpecial(false)}
            color={selectedSpecial === false ? 'default' : 'default'}
            size="small"
          />
        </Stack>
      </Box>

      {/* 清除筛选按钮 */}
      {(searchText || selectedLetter || selectedLanguage || selectedSpecial !== null) && (
        <Button
          fullWidth
          variant="outlined"
          onClick={clearFilters}
          size="small"
        >
          清除所有筛选
        </Button>
      )}
    </Box>
  );

  return (
    <Box>
      {/* 页面标题 */}
      <Box sx={{ mb: 4, textAlign: 'center', position: 'relative', zIndex: 1 }}>
        {/* 头像 */}
        {siteConfig?.avatarUrl && (
          <Box
            sx={{
              mb: 2,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Box
              sx={{
                width: { xs: 80, sm: 100, md: 120 },
                height: { xs: 80, sm: 100, md: 120 },
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
                src={siteConfig.avatarUrl}
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

      {/* PC端布局：左侧筛选器 + 右侧内容 (3:7比例) */}
      {isDesktop ? (
        <Grid container spacing={2}>
          {/* 左侧筛选器（PC端）- 30% */}
          <Grid item xs={12} md={3}>
            <Card 
              sx={{ 
                position: 'sticky', 
                top: 88,
                backdropFilter: 'blur(10px)',
                backgroundColor: theme.palette.mode === 'dark'
                  ? 'rgba(20, 25, 45, 0.6)'
                  : 'rgba(255, 255, 255, 0.6)',
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <CardContent>
                {/* 搜索栏 */}
                <TextField
                  fullWidth
                  placeholder="搜索..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  size="small"
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
                <FilterPanel />
              </CardContent>
            </Card>
          </Grid>

          {/* 右侧歌曲列表（PC端） - 70% */}
          <Grid item xs={12} md={9}>
            <Paper
              sx={{
                display: 'flex',
                flexDirection: 'column',
                height: 'fit-content',
                maxHeight: 'calc(100vh - 180px)',
                overflow: 'hidden',
                backdropFilter: 'blur(10px)',
                backgroundColor: theme.palette.mode === 'dark'
                  ? 'rgba(20, 25, 45, 0.6)'
                  : 'rgba(255, 255, 255, 0.6)',
                border: `1px solid ${theme.palette.divider}`,
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
          </Grid>
        </Grid>
      ) : (
        /* 移动端布局 */
        <>
          {/* 搜索栏和筛选按钮 */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  fullWidth
                  placeholder="搜索歌曲名或歌手..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={() => setMobileFilterOpen(true)}
                  startIcon={<FilterList />}
                >
                  筛选
                </Button>
              </Stack>
            </CardContent>
          </Card>

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
              backdropFilter: 'blur(10px)',
              backgroundColor: theme.palette.mode === 'dark'
                ? 'rgba(20, 25, 45, 0.6)'
                : 'rgba(255, 255, 255, 0.6)',
              border: `1px solid ${theme.palette.divider}`,
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
function SongListItem({ song, onCopy, isLast, theme }) {
  const isDark = theme?.palette.mode === 'dark';
  
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
              <Chip
                label={song.language}
                size="small"
                variant="outlined"
                sx={{ 
                  height: 20, 
                  fontSize: '0.65rem',
                  '& .MuiChip-label': {
                    px: 0.75,
                  },
                }}
              />
              <Chip
                label={song.category}
                size="small"
                variant="outlined"
                sx={{ 
                  height: 20, 
                  fontSize: '0.65rem',
                  '& .MuiChip-label': {
                    px: 0.75,
                  },
                }}
              />
              <Chip
                label={song.firstLetter}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.65rem',
                  background: `linear-gradient(135deg, ${getLetterColor(song.firstLetter)} 0%, #7B68EE 100%)`,
                  color: 'white',
                  fontWeight: 600,
                  '& .MuiChip-label': {
                    px: 0.75,
                  },
                }}
              />
            </Stack>
          }
        />
      </ListItem>
  );
}

export default HomePage;

