import React from 'react';
import { Box, List } from '@mui/material';
import SongListItem from './SongListItem';

/**
 * 歌曲列表 - 跟随页面滚动，不单独滚动
 */
function VirtualizedSongList({
  songs,
  onCopy,
  onFilterByLanguage,
  onFilterByCategory,
  onFilterByLetter,
  isDesktop,
  theme,
}) {
  return (
    <List disablePadding component="div">
      {songs.map((song, index) => (
        <SongListItem
          key={song.songName + (song.singer || '') + index}
          song={song}
          onCopy={onCopy}
          isLast={index === songs.length - 1}
          onFilterByLanguage={onFilterByLanguage}
          onFilterByCategory={onFilterByCategory}
          onFilterByLetter={onFilterByLetter}
          isDesktop={isDesktop}
          theme={theme}
        />
      ))}
    </List>
  );
}

export default React.memo(VirtualizedSongList);
