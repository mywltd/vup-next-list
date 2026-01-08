import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  Stack,
  FormControlLabel,
  Switch,
  Paper,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { Upload, Download, DeleteForever } from '@mui/icons-material';
import { playlistAPI } from '../../services/api';
import { downloadFile } from '../../utils/helpers';

function ImportExportPanel() {
  const [message, setMessage] = useState({ type: '', text: '' });
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [clearExisting, setClearExisting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    setMessage({ type: '', text: '' });

    try {
      const { songs } = await playlistAPI.exportPlaylist();
      const filename = `playlist-${new Date().toISOString().split('T')[0]}.json`;
      downloadFile(songs, filename);
      setMessage({ type: 'success', text: `成功导出 ${songs.length} 首歌曲` });
    } catch (error) {
      setMessage({ type: 'error', text: '导出失败: ' + error.message });
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImporting(true);
    setMessage({ type: '', text: '' });

    try {
      const text = await file.text();
      const songs = JSON.parse(text);

      if (!Array.isArray(songs)) {
        throw new Error('无效的 JSON 格式');
      }

      const result = await playlistAPI.importPlaylist(songs, clearExisting);
      setMessage({
        type: 'success',
        text: `成功导入 ${result.imported} / ${result.total} 首歌曲`,
      });
    } catch (error) {
      setMessage({ type: 'error', text: '导入失败: ' + error.message });
    } finally {
      setImporting(false);
      event.target.value = '';
    }
  };

  const handleClearPlaylist = async () => {
    if (!window.confirm('确定要清空整个歌单吗？此操作不可恢复！')) {
      return;
    }

    try {
      await playlistAPI.clearPlaylist();
      setMessage({ type: 'success', text: '歌单已清空' });
    } catch (error) {
      setMessage({ type: 'error', text: '清空失败: ' + error.message });
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight={600}>
        导入导出
      </Typography>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      <Stack spacing={3}>
        {/* 导出 */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            导出歌单
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            将当前歌单导出为 JSON 文件，可用于备份或迁移。
          </Typography>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? '导出中...' : '导出歌单 JSON'}
          </Button>
        </Paper>

        {/* 导入 */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            导入歌单
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            从 JSON 文件导入歌单数据。
          </Typography>
          
          <FormControlLabel
            control={
              <Switch
                checked={clearExisting}
                onChange={(e) => setClearExisting(e.target.checked)}
                color="warning"
              />
            }
            label="导入前清空现有歌单"
            sx={{ mb: 2 }}
          />

          <Button
            variant="contained"
            component="label"
            startIcon={<Upload />}
            disabled={importing}
          >
            {importing ? '导入中...' : '选择 JSON 文件'}
            <input
              type="file"
              hidden
              accept=".json"
              onChange={handleImport}
            />
          </Button>
        </Paper>

        {/* JSON 格式说明 */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            JSON 格式要求
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            JSON 文件应包含一个数组，每首歌曲包含以下字段：
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText
                primary="songName"
                secondary="歌曲名（必填）"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="singer"
                secondary="歌手（必填）"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="language"
                secondary="语种（必填）"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="category"
                secondary="种类（必填）"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="firstLetter"
                secondary="首字母（必填）"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="special"
                secondary="是否特殊歌曲 (true/false)"
              />
            </ListItem>
          </List>
        </Paper>

        {/* 危险操作 */}
        <Paper sx={{ p: 3, border: '1px solid', borderColor: 'error.main' }}>
          <Typography variant="subtitle1" fontWeight={600} color="error" gutterBottom>
            危险操作
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            清空整个歌单，此操作不可恢复！
          </Typography>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteForever />}
            onClick={handleClearPlaylist}
          >
            清空歌单
          </Button>
        </Paper>
      </Stack>
    </Box>
  );
}

export default ImportExportPanel;

