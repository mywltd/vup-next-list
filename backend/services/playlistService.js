import { db } from '../db/init.js';

export class PlaylistService {
  // 获取歌单列表（支持分页、筛选、搜索）
  static getPlaylist(options = {}) {
    const {
      page = 1,
      limit = 50,
      firstLetter = null,
      language = null,
      special = null,
      search = ''
    } = options;

    let query = 'SELECT * FROM playlist WHERE 1=1';
    const params = [];

    if (firstLetter) {
      query += ' AND firstLetter = ?';
      params.push(firstLetter);
    }

    if (language) {
      query += ' AND language = ?';
      params.push(language);
    }

    if (special !== null) {
      query += ' AND special = ?';
      params.push(special ? 1 : 0);
    }

    if (search) {
      query += ' AND (songName LIKE ? OR singer LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // 获取总数
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as count');
    const countStmt = db.prepare(countQuery);
    const { count } = countStmt.get(...params);

    // 添加排序和分页
    query += ' ORDER BY firstLetter, songName LIMIT ? OFFSET ?';
    params.push(limit, (page - 1) * limit);

    const stmt = db.prepare(query);
    const songs = stmt.all(...params);

    return {
      songs: songs.map(song => ({
        ...song,
        special: Boolean(song.special)
      })),
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    };
  }

  // 获取所有语种列表
  static getLanguages() {
    const stmt = db.prepare('SELECT DISTINCT language FROM playlist ORDER BY language');
    return stmt.all().map(row => row.language);
  }

  // 获取所有首字母列表
  static getFirstLetters() {
    const stmt = db.prepare('SELECT DISTINCT firstLetter FROM playlist ORDER BY firstLetter');
    return stmt.all().map(row => row.firstLetter);
  }

  // 获取所有种类列表
  static getCategories() {
    const stmt = db.prepare('SELECT DISTINCT category FROM playlist ORDER BY category');
    return stmt.all().map(row => row.category);
  }

  // 获取所有标签云数据（一次返回所有筛选选项）
  static getTagCloud() {
    const languages = this.getLanguages();
    const categories = this.getCategories();
    const firstLetters = this.getFirstLetters();
    
    return {
      languages,
      categories,
      firstLetters
    };
  }

  // 添加歌曲
  static addSong(songData) {
    const { songName, singer, language, category, special, firstLetter, bilibiliClipUrl } = songData;

    const stmt = db.prepare(`
      INSERT INTO playlist (songName, singer, language, category, special, firstLetter, bilibili_clip_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      songName,
      singer,
      language,
      category,
      special ? 1 : 0,
      firstLetter,
      bilibiliClipUrl || null
    );

    return {
      id: result.lastInsertRowid,
      ...songData
    };
  }

  // 更新歌曲
  static updateSong(id, songData) {
    const { songName, singer, language, category, special, firstLetter, bilibiliClipUrl } = songData;

    const stmt = db.prepare(`
      UPDATE playlist 
      SET songName = ?, singer = ?, language = ?, category = ?, 
          special = ?, firstLetter = ?, bilibili_clip_url = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      songName,
      singer,
      language,
      category,
      special ? 1 : 0,
      firstLetter,
      bilibiliClipUrl || null,
      id
    );

    return { id, ...songData };
  }

  // 删除歌曲
  static deleteSong(id) {
    const stmt = db.prepare('DELETE FROM playlist WHERE id = ?');
    const result = stmt.run(id);
    
    if (result.changes === 0) {
      throw new Error('歌曲不存在');
    }

    return { success: true, message: '删除成功' };
  }

  // 批量导入歌曲
  static importPlaylist(songs) {
    try {
      db.exec('BEGIN TRANSACTION');

      const stmt = db.prepare(`
        INSERT INTO playlist (songName, singer, language, category, special, firstLetter, bilibili_clip_url)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      let imported = 0;
      for (const song of songs) {
        try {
          stmt.run(
            song.songName,
            song.singer,
            song.language,
            song.category,
            song.special ? 1 : 0,
            song.firstLetter,
            song.bilibiliClipUrl || null
          );
          imported++;
        } catch (error) {
          console.error('导入歌曲失败:', song.songName, error.message);
        }
      }

      db.exec('COMMIT');

      return {
        success: true,
        imported,
        total: songs.length
      };
    } catch (error) {
      db.exec('ROLLBACK');
      throw new Error('导入失败: ' + error.message);
    }
  }

  // 导出歌单
  static exportPlaylist() {
    const stmt = db.prepare('SELECT songName, singer, language, category, special, firstLetter, bilibili_clip_url FROM playlist ORDER BY firstLetter, songName');
    const songs = stmt.all();

    return songs.map(song => ({
      songName: song.songName,
      singer: song.singer,
      language: song.language,
      category: song.category,
      special: Boolean(song.special),
      firstLetter: song.firstLetter,
      ...(song.bilibili_clip_url && { bilibiliClipUrl: song.bilibili_clip_url })
    }));
  }

  // 清空歌单
  static clearPlaylist() {
    const stmt = db.prepare('DELETE FROM playlist');
    stmt.run();
    return { success: true, message: '歌单已清空' };
  }
}

