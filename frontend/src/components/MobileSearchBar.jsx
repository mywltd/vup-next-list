import React from 'react';
import { Box, TextField, Button, InputAdornment } from '@mui/material';
import { Search, FilterList } from '@mui/icons-material';

/**
 * 移动端搜索框 + 筛选按钮
 */
const MobileSearchBar = React.memo(function MobileSearchBar({
  searchText,
  onSearchChange,
  onFilterClick,
  theme,
}) {
  const isDark = theme.palette.mode === 'dark';
  return (
    <Box sx={{ mb: 3 }}>
      <TextField
        fullWidth
        placeholder="搜索歌曲或歌手..."
        value={searchText}
        onChange={(e) => onSearchChange(e.target.value)}
        size="medium"
        sx={{
          mb: 1.5,
          '& .MuiOutlinedInput-root': {
            backgroundColor: isDark ? 'rgba(20, 25, 45, 0.75)' : 'rgba(255, 255, 255, 0.45)',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(110, 193, 228, 0.2)'}`,
            borderRadius: 3,
            boxShadow: isDark ? 'none' : '0 2px 8px rgba(110, 193, 228, 0.08)',
            '&:hover': {
              backgroundColor: isDark ? 'rgba(20, 25, 45, 0.85)' : 'rgba(255, 255, 255, 0.6)',
              borderColor: 'primary.main',
            },
            '&.Mui-focused': {
              backgroundColor: isDark ? 'rgba(20, 25, 45, 0.85)' : 'rgba(255, 255, 255, 0.6)',
              borderColor: 'primary.main',
              boxShadow: isDark ? '0 0 0 2px rgba(110, 193, 228, 0.2)' : '0 0 0 2px rgba(110, 193, 228, 0.15)',
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
      <Button
        fullWidth
        variant="outlined"
        onClick={onFilterClick}
        startIcon={<FilterList />}
        sx={{
          height: '48px',
          backgroundColor: isDark ? 'rgba(20, 25, 45, 0.75)' : 'rgba(255, 255, 255, 0.45)',
          border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(110, 193, 228, 0.25)'}`,
          borderRadius: 3,
          fontWeight: 600,
          fontSize: '0.95rem',
          color: 'primary.main',
          boxShadow: isDark ? 'none' : '0 2px 8px rgba(110, 193, 228, 0.08)',
          '&:hover': {
            backgroundColor: isDark ? 'rgba(20, 25, 45, 0.85)' : 'rgba(255, 255, 255, 0.6)',
            borderColor: 'primary.main',
            transform: 'translateY(-2px)',
            boxShadow: isDark ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 4px 16px rgba(110, 193, 228, 0.2)',
          },
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        筛选
      </Button>
    </Box>
  );
});

export default MobileSearchBar;
