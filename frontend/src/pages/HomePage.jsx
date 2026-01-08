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
} from '@mui/material';
import { Search, ContentCopy, MusicNote, FilterList } from '@mui/icons-material';
import { playlistAPI } from '../services/api';
import { debounce, copyToClipboard, getLetterColor } from '../utils/helpers';

function HomePage({ siteConfig }) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  
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
              sx={{
                mb: 1,
                ...(selectedLetter === letter && {
                  background: `linear-gradient(135deg, ${getLetterColor(letter)} 0%, #7B68EE 100%)`,
                }),
              }}
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
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography
          variant={isDesktop ? 'h3' : 'h4'}
          fontWeight={700}
          sx={{
            background: 'linear-gradient(135deg, #FF6B9D 0%, #7B68EE 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
          }}
        >
          {siteConfig?.defaultPlaylistName || '歌单'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          共收录 {total} 首歌曲
        </Typography>
      </Box>

      {/* PC端布局：左侧筛选器 + 右侧内容 */}
      {isDesktop ? (
        <Grid container spacing={3}>
          {/* 左侧筛选器（PC端） */}
          <Grid item xs={12} md={3}>
            <Card sx={{ position: 'sticky', top: 88 }}>
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

          {/* 右侧歌曲列表（PC端） */}
          <Grid item xs={12} md={9}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : songs.length === 0 ? (
              <Card>
                <CardContent>
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <MusicNote sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      暂无歌曲
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ) : (
              <>
                <Grid container spacing={2}>
                  {songs.map((song) => (
                    <Grid item xs={12} sm={6} lg={4} xl={3} key={song.id}>
                      <SongCard song={song} onCopy={handleCopy} />
                    </Grid>
                  ))}
                </Grid>

                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={handlePageChange}
                      color="primary"
                      size="large"
                      showFirstButton
                      showLastButton
                    />
                  </Box>
                )}
              </>
            )}
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

          {/* 筛选器（移动端废弃原有的Card） */}
          {/* 歌曲列表 */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : songs.length === 0 ? (
            <Card>
              <CardContent>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <MusicNote sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    暂无歌曲
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ) : (
            <>
              <Grid container spacing={2}>
                {songs.map((song) => (
                  <Grid item xs={12} sm={6} key={song.id}>
                    <SongCard song={song} onCopy={handleCopy} />
                  </Grid>
                ))}
              </Grid>

              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </>
          )}
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

// 歌曲卡片组件
function SongCard({ song, onCopy }) {
  return (
    <Card
      sx={{
        height: '100%',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'visible',
      }}
    >
      <CardContent>
        {song.special && (
          <Chip
            label="特殊"
            color="secondary"
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
            }}
          />
        )}
        
        <Tooltip title="点击复制歌曲名">
          <Box
            onClick={() => onCopy(song.songName)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              mb: 1,
              '&:hover': {
                '& .copy-icon': {
                  opacity: 1,
                },
              },
            }}
          >
            <Typography
              variant="h6"
              fontWeight={600}
              sx={{
                flexGrow: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {song.songName}
            </Typography>
            <IconButton
              size="small"
              className="copy-icon"
              sx={{
                opacity: 0,
                transition: 'opacity 0.2s',
                ml: 1,
              }}
            >
              <ContentCopy fontSize="small" />
            </IconButton>
          </Box>
        </Tooltip>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          {song.singer}
        </Typography>

        <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
          <Chip
            label={song.language}
            size="small"
            variant="outlined"
          />
          <Chip
            label={song.category}
            size="small"
            variant="outlined"
          />
          <Chip
            label={song.firstLetter}
            size="small"
            sx={{
              background: `linear-gradient(135deg, ${getLetterColor(song.firstLetter)} 0%, #7B68EE 100%)`,
              color: 'white',
            }}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}

export default HomePage;

