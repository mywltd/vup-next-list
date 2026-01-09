import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Chip,
  Alert,
  Stack,
  Pagination,
} from '@mui/material';
import { Add, Edit, Delete, Search } from '@mui/icons-material';
import { playlistAPI } from '../../services/api';

function PlaylistManagePanel() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchText, setSearchText] = useState('');
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    songName: '',
    singer: '',
    language: '',
    category: '',
    special: false,
    firstLetter: '',
    bilibiliClipUrl: '',
  });

  useEffect(() => {
    loadPlaylist();
  }, [page, searchText]);

  const loadPlaylist = async () => {
    setLoading(true);
    try {
      const data = await playlistAPI.getPlaylist({
        page,
        limit: 20,
        search: searchText,
      });
      setSongs(data.songs);
      setTotalPages(data.totalPages);
    } catch (error) {
      setMessage({ type: 'error', text: '加载歌单失败' });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditMode(false);
    setCurrentSong(null);
    setFormData({
      songName: '',
      singer: '',
      language: '',
      category: '',
      special: false,
      firstLetter: '',
      bilibiliClipUrl: '',
    });
    setDialogOpen(true);
  };

  const handleEdit = (song) => {
    setEditMode(true);
    setCurrentSong(song);
    setFormData({
      songName: song.songName,
      singer: song.singer,
      language: song.language,
      category: song.category,
      special: song.special,
      firstLetter: song.firstLetter,
      bilibiliClipUrl: song.bilibiliClipUrl || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除这首歌曲吗？')) {
      return;
    }

    try {
      await playlistAPI.deleteSong(id);
      setMessage({ type: 'success', text: '删除成功' });
      loadPlaylist();
    } catch (error) {
      setMessage({ type: 'error', text: '删除失败: ' + error.message });
    }
  };

  const handleSave = async () => {
    if (!formData.songName.trim() || !formData.singer.trim()) {
      setMessage({ type: 'error', text: '歌曲名和歌手不能为空' });
      return;
    }

    try {
      if (editMode) {
        await playlistAPI.updateSong(currentSong.id, formData);
        setMessage({ type: 'success', text: '更新成功' });
      } else {
        await playlistAPI.addSong(formData);
        setMessage({ type: 'success', text: '添加成功' });
      }
      setDialogOpen(false);
      loadPlaylist();
    } catch (error) {
      setMessage({ type: 'error', text: '保存失败: ' + error.message });
    }
  };

  const handleChange = (field) => (event) => {
    const value = field === 'special' ? event.target.checked : event.target.value;
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" fontWeight={600}>
          歌单管理
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>
          添加歌曲
        </Button>
      </Box>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      {/* 搜索 */}
      <TextField
        fullWidth
        placeholder="搜索歌曲..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
        }}
      />

      {/* 歌曲列表 */}
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>歌曲名</TableCell>
              <TableCell>歌手</TableCell>
              <TableCell>语种</TableCell>
              <TableCell>种类</TableCell>
              <TableCell>首字母</TableCell>
              <TableCell>特殊</TableCell>
              <TableCell align="right">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {songs.map((song) => (
              <TableRow key={song.id}>
                <TableCell>{song.songName}</TableCell>
                <TableCell>{song.singer}</TableCell>
                <TableCell><Chip label={song.language} size="small" /></TableCell>
                <TableCell><Chip label={song.category} size="small" /></TableCell>
                <TableCell><Chip label={song.firstLetter} size="small" color="primary" /></TableCell>
                <TableCell>
                  {song.special && <Chip label="特殊" size="small" color="secondary" />}
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => handleEdit(song)}>
                    <Edit />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(song.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 分页 */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}

      {/* 添加/编辑对话框 */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? '编辑歌曲' : '添加歌曲'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="歌曲名"
              value={formData.songName}
              onChange={handleChange('songName')}
              required
            />
            <TextField
              fullWidth
              label="歌手"
              value={formData.singer}
              onChange={handleChange('singer')}
              required
            />
            <TextField
              fullWidth
              label="语种"
              value={formData.language}
              onChange={handleChange('language')}
              required
            />
            <TextField
              fullWidth
              label="种类"
              value={formData.category}
              onChange={handleChange('category')}
              required
            />
            <TextField
              fullWidth
              label="首字母"
              value={formData.firstLetter}
              onChange={handleChange('firstLetter')}
              required
              inputProps={{ maxLength: 1 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.special}
                  onChange={handleChange('special')}
                />
              }
              label="特殊歌曲"
            />
            <TextField
              fullWidth
              label="B站切片链接"
              value={formData.bilibiliClipUrl}
              onChange={handleChange('bilibiliClipUrl')}
              placeholder="https://www.bilibili.com/video/BVxxxxxxxxx"
              helperText="可选，填写后会在歌曲旁显示播放图标"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleSave}>
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PlaylistManagePanel;

