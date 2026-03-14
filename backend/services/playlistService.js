import { db, getSiteConfig } from '../db/init.js';

export class PlaylistService {
  static parseSongCreatedAt(createdAt) {
    if (!createdAt) {
      return null;
    }

    const normalized = typeof createdAt === 'string'
      ? createdAt.replace(' ', 'T') + 'Z'
      : createdAt;

    const parsed = new Date(normalized);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  static getSongTimestamp(createdAt) {
    const parsed = this.parseSongCreatedAt(createdAt);
    return parsed ? parsed.getTime() : 0;
  }

  static compareSongName(a, b) {
    return String(a || '').localeCompare(String(b || ''), 'zh-Hans-CN');
  }

  static compareAlphabeticalSongs(a, b) {
    return (
      this.compareSongName(a.firstLetter, b.firstLetter) ||
      this.compareSongName(a.songName, b.songName) ||
      this.compareSongName(a.singer, b.singer) ||
      ((a.id || 0) - (b.id || 0))
    );
  }

  static compareNewSongs(a, b) {
    return (
      this.getSongTimestamp(b.created_at) - this.getSongTimestamp(a.created_at) ||
      this.compareAlphabeticalSongs(a, b)
    );
  }

  static getDeterministicRandomScore(songId, seed) {
    const id = Number(songId) || 0;
    const normalizedSeed = Number(seed) || 0;
    const value = Math.imul(id ^ normalizedSeed, 2654435761) >>> 0;
    return value;
  }

  static sortSongsForDisplay(songs, options) {
    const {
      highlightNewSongs,
      enableRandomRecommendations,
      newSongThreshold,
      randomSeed
    } = options;

    const isNewSong = (song) => {
      if (!highlightNewSongs) {
        return false;
      }
      return this.getSongTimestamp(song.created_at) >= newSongThreshold.getTime();
    };

    const alphabeticalSongs = [...songs].sort((a, b) => this.compareAlphabeticalSongs(a, b));

    if (!highlightNewSongs && !enableRandomRecommendations) {
      return alphabeticalSongs;
    }

    if (!highlightNewSongs && enableRandomRecommendations) {
      return [...songs].sort((a, b) => (
        this.getDeterministicRandomScore(a.id, randomSeed) - this.getDeterministicRandomScore(b.id, randomSeed) ||
        this.compareAlphabeticalSongs(a, b)
      ));
    }

    const newSongs = [];
    const oldSongs = [];

    songs.forEach((song) => {
      if (isNewSong(song)) {
        newSongs.push(song);
      } else {
        oldSongs.push(song);
      }
    });

    newSongs.sort((a, b) => this.compareNewSongs(a, b));

    if (enableRandomRecommendations) {
      oldSongs.sort((a, b) => (
        this.getDeterministicRandomScore(a.id, randomSeed) - this.getDeterministicRandomScore(b.id, randomSeed) ||
        this.compareAlphabeticalSongs(a, b)
      ));
    } else {
      oldSongs.sort((a, b) => this.compareAlphabeticalSongs(a, b));
    }

    return [...newSongs, ...oldSongs];
  }

  static buildFilterQuery(options = {}) {
    const {
      firstLetter = null,
      language = null,
      languages = null,
      category = null,
      categories = null,
      special = null,
      search = ''
    } = options;

    let query = ' FROM playlist WHERE 1=1';
    const params = [];

    if (firstLetter) {
      query += ' AND firstLetter = ?';
      params.push(firstLetter);
    }

    const languageList = languages || (language ? [language] : null);
    if (languageList && languageList.length > 0) {
      const placeholders = languageList.map(() => '?').join(',');
      query += ` AND language IN (${placeholders})`;
      params.push(...languageList);
    }

    const categoryList = categories || (category ? [category] : null);
    if (categoryList && categoryList.length > 0) {
      const categoryConditions = categoryList.map(() =>
        '(category = ? OR categories_json LIKE ?)'
      ).join(' OR ');
      query += ` AND (${categoryConditions})`;
      categoryList.forEach(cat => {
        params.push(cat, `%"${cat}"%`);
      });
    }

    if (special !== null) {
      query += ' AND special = ?';
      params.push(special ? 1 : 0);
    }

    if (search) {
      query += ' AND (songName LIKE ? OR singer LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    return { query, params };
  }

  static normalizeSong(song, highlightNewSongs, newSongThreshold) {
    const createdAt = this.parseSongCreatedAt(song.created_at);
    const isNewSong = Boolean(highlightNewSongs && createdAt && createdAt >= newSongThreshold);

    let categories = [song.category];
    if (song.categories_json) {
      try {
        categories = JSON.parse(song.categories_json);
      } catch (e) {
        categories = [song.category];
      }
    }

    return {
      id: song.id,
      songName: song.songName,
      singer: song.singer,
      language: song.language,
      category: song.category,
      categories,
      special: Boolean(song.special),
      firstLetter: song.firstLetter,
      isNewSong,
      createdAt: song.created_at,
      ...(song.bilibili_clip_url && { bilibiliClipUrl: song.bilibili_clip_url })
    };
  }

  // 获取歌单列表（支持分页、筛选、搜索）
  static getPlaylist(options = {}) {
    const {
      page = 1,
      limit = 50,
      randomSeed = null
    } = options;

    // 获取站点配置，检查是否启用新歌高亮
    const siteConfig = getSiteConfig();
    const highlightNewSongs = siteConfig && Boolean(siteConfig.highlight_new_songs);
    const enableRandomRecommendations = siteConfig && Boolean(siteConfig.enable_random_recommendations);
    const newSongDays = siteConfig ? (parseInt(siteConfig.new_song_days, 10) || 7) : 7;
    const normalizedNewSongDays = Math.max(1, newSongDays);
    const parsedRandomSeed = Number.parseInt(randomSeed, 10);
    const effectiveRandomSeed = Number.isFinite(parsedRandomSeed)
      ? Math.abs(parsedRandomSeed)
      : Date.now();

    const { query: filterQuery, params } = this.buildFilterQuery(options);
    const stmt = db.prepare(`SELECT *${filterQuery}`);
    const allSongs = stmt.all(...params);

    // 计算每首歌是否为新歌
    const now = new Date();
    const newSongThreshold = new Date(now.getTime() - normalizedNewSongDays * 24 * 60 * 60 * 1000);
    const sortedSongs = this.sortSongsForDisplay(allSongs, {
      highlightNewSongs,
      enableRandomRecommendations,
      newSongThreshold,
      randomSeed: effectiveRandomSeed
    });
    const count = sortedSongs.length;
    const offset = (page - 1) * limit;
    const songs = sortedSongs.slice(offset, offset + limit);

    return {
      songs: songs.map(song => this.normalizeSong(song, highlightNewSongs, newSongThreshold)),
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
      highlightNewSongs: highlightNewSongs,
      newSongDays: normalizedNewSongDays,
      enableRandomRecommendations
    };
  }

  // 获取一首随机歌曲（支持筛选、搜索）
  static getRandomSong(options = {}) {
    const siteConfig = getSiteConfig();
    const highlightNewSongs = siteConfig && Boolean(siteConfig.highlight_new_songs);
    const newSongDays = siteConfig ? (parseInt(siteConfig.new_song_days, 10) || 7) : 7;
    const normalizedNewSongDays = Math.max(1, newSongDays);
    const { query: filterQuery, params } = this.buildFilterQuery(options);
    const query = `SELECT *${filterQuery} ORDER BY RANDOM() LIMIT 1`;
    const stmt = db.prepare(query);
    const song = stmt.get(...params);

    if (!song) {
      return null;
    }

    const now = new Date();
    const newSongThreshold = new Date(now.getTime() - normalizedNewSongDays * 24 * 60 * 60 * 1000);

    return this.normalizeSong(song, highlightNewSongs, newSongThreshold);
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

  // 获取所有种类列表（解析多标签）
  static getCategories() {
    // 获取所有歌曲的分类数据
    const stmt = db.prepare('SELECT categories_json, category FROM playlist');
    const songs = stmt.all();
    
    // 使用 Set 去重
    const categoriesSet = new Set();
    
    songs.forEach(song => {
      if (song.categories_json) {
        try {
          const categories = JSON.parse(song.categories_json);
          categories.forEach(cat => categoriesSet.add(cat));
        } catch (e) {
          // 解析失败，回退到主分类
          if (song.category) {
            categoriesSet.add(song.category);
          }
        }
      } else if (song.category) {
        // 没有 categories_json，使用主分类
        categoriesSet.add(song.category);
      }
    });
    
    // 转为数组并排序
    return Array.from(categoriesSet).sort();
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
    const { songName, singer, language, category, categories, special, firstLetter, bilibiliClipUrl } = songData;

    // 处理多标签：优先使用 categories，回退到 category
    let categoriesArray = categories || [category];
    if (!Array.isArray(categoriesArray)) {
      categoriesArray = [categoriesArray];
    }
    const mainCategory = categoriesArray[0] || '其他';
    const categoriesJson = JSON.stringify(categoriesArray);

    const stmt = db.prepare(`
      INSERT INTO playlist (songName, singer, language, category, categories_json, special, firstLetter, bilibili_clip_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      songName,
      singer,
      language,
      mainCategory,
      categoriesJson,
      special ? 1 : 0,
      firstLetter,
      bilibiliClipUrl || null
    );

    return {
      id: result.lastInsertRowid,
      ...songData,
      categories: categoriesArray
    };
  }

  // 更新歌曲
  static updateSong(id, songData) {
    const { songName, singer, language, category, categories, special, firstLetter, bilibiliClipUrl } = songData;

    // 处理多标签：优先使用 categories，回退到 category
    let categoriesArray = categories || [category];
    if (!Array.isArray(categoriesArray)) {
      categoriesArray = [categoriesArray];
    }
    const mainCategory = categoriesArray[0] || '其他';
    const categoriesJson = JSON.stringify(categoriesArray);

    const stmt = db.prepare(`
      UPDATE playlist 
      SET songName = ?, singer = ?, language = ?, category = ?, categories_json = ?, 
          special = ?, firstLetter = ?, bilibili_clip_url = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      songName,
      singer,
      language,
      mainCategory,
      categoriesJson,
      special ? 1 : 0,
      firstLetter,
      bilibiliClipUrl || null,
      id
    );

    return { id, ...songData, categories: categoriesArray };
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
        INSERT INTO playlist (songName, singer, language, category, categories_json, special, firstLetter, bilibili_clip_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      let imported = 0;
      for (const song of songs) {
        try {
          // 处理多标签
          let categoriesArray = song.categories || [song.category];
          if (!Array.isArray(categoriesArray)) {
            categoriesArray = [categoriesArray];
          }
          const mainCategory = categoriesArray[0] || '其他';
          const categoriesJson = JSON.stringify(categoriesArray);
          
          stmt.run(
            song.songName,
            song.singer,
            song.language,
            mainCategory,
            categoriesJson,
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
    const stmt = db.prepare('SELECT songName, singer, language, category, categories_json, special, firstLetter, bilibili_clip_url FROM playlist ORDER BY firstLetter, songName');
    const songs = stmt.all();

    return songs.map(song => {
      // 解析多标签
      let categories = [song.category];
      if (song.categories_json) {
        try {
          categories = JSON.parse(song.categories_json);
        } catch (e) {
          categories = [song.category];
        }
      }
      
      return {
        songName: song.songName,
        singer: song.singer,
        language: song.language,
        category: song.category, // 保留主分类
        categories: categories, // 新增多标签
        special: Boolean(song.special),
        firstLetter: song.firstLetter,
        ...(song.bilibili_clip_url && { bilibiliClipUrl: song.bilibili_clip_url })
      };
    });
  }

  // 清空歌单
  static clearPlaylist() {
    const stmt = db.prepare('DELETE FROM playlist');
    stmt.run();
    return { success: true, message: '歌单已清空' };
  }
}
