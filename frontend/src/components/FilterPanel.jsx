import React from 'react';
import { Box, Typography, Chip, Button } from '@mui/material';
import { Star, Refresh } from '@mui/icons-material';

/**
 * 筛选面板 - 首字母/语言/种类/戏曲/特殊歌曲
 * 使用 React.memo 避免父组件重渲染时整体重建
 */
const FilterPanel = React.memo(function FilterPanel({
  firstLetters,
  languages,
  categories,
  hasXiqu,
  selectedLetter,
  selectedLanguages,
  selectedCategories,
  selectedSpecial,
  onLetterChange,
  onLanguageToggle,
  onCategoryToggle,
  onSpecialToggle,
  onClear,
  theme,
}) {
  const isDark = theme?.palette?.mode === 'dark';

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
              onClick={() => onLetterChange(letter)}
              sx={{
                cursor: 'pointer',
                backgroundColor: selectedLetter === letter
                  ? 'primary.main'
                  : isDark ? 'rgba(110, 193, 228, 0.15)' : 'rgba(110, 193, 228, 0.12)',
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
              onClick={() => onLanguageToggle(lang)}
              sx={{
                cursor: 'pointer',
                backgroundColor: selectedLanguages.includes(lang)
                  ? 'primary.main'
                  : isDark ? 'rgba(110, 193, 228, 0.15)' : 'rgba(110, 193, 228, 0.12)',
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
            onClick={() => onCategoryToggle('戏曲')}
            sx={{
              cursor: 'pointer',
              backgroundColor: selectedCategories.includes('戏曲')
                ? '#d32f2f'
                : isDark ? 'rgba(211, 47, 47, 0.15)' : 'rgba(211, 47, 47, 0.12)',
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
          {categories.filter((cat) => cat !== '戏曲').map((cat) => (
            <Chip
              key={cat}
              label={cat}
              size="small"
              onClick={() => onCategoryToggle(cat)}
              sx={{
                cursor: 'pointer',
                backgroundColor: selectedCategories.includes(cat)
                  ? 'secondary.main'
                  : isDark ? 'rgba(255, 182, 193, 0.15)' : 'rgba(255, 182, 193, 0.12)',
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
          onClick={onSpecialToggle}
          sx={{
            cursor: 'pointer',
            backgroundColor: selectedSpecial === true
              ? 'secondary.main'
              : isDark ? 'rgba(255, 182, 193, 0.15)' : 'rgba(255, 182, 193, 0.12)',
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
        onClick={onClear}
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
});

export default FilterPanel;
