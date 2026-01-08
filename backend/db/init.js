import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 确保数据目录存在
const dataDir = process.env.DATA_DIR || path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'database.db');

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// 初始化数据库表结构
export function initDatabase() {
  // 管理员表
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 歌单表
  db.exec(`
    CREATE TABLE IF NOT EXISTS playlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      songName TEXT NOT NULL,
      singer TEXT NOT NULL,
      language TEXT NOT NULL,
      category TEXT NOT NULL,
      special INTEGER DEFAULT 0,
      firstLetter TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 创建索引以提高查询性能
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_firstLetter ON playlist(firstLetter);
    CREATE INDEX IF NOT EXISTS idx_language ON playlist(language);
    CREATE INDEX IF NOT EXISTS idx_special ON playlist(special);
  `);

  // 站点配置表
  db.exec(`
    CREATE TABLE IF NOT EXISTS site_config (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      site_name TEXT NOT NULL,
      site_subtitle TEXT,
      default_playlist_name TEXT NOT NULL,
      avatar_url TEXT,
      background_url TEXT,
      theme_config_json TEXT,
      seo_keywords TEXT,
      seo_description TEXT,
      custom_css TEXT,
      custom_js TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // 迁移旧数据：检查并添加新字段（如果表已存在）
  try {
    const tableInfo = db.prepare("PRAGMA table_info(site_config)").all();
    const columns = tableInfo.map(col => col.name);
    
    if (!columns.includes('site_subtitle')) {
      db.exec('ALTER TABLE site_config ADD COLUMN site_subtitle TEXT');
    }
    if (!columns.includes('seo_keywords')) {
      db.exec('ALTER TABLE site_config ADD COLUMN seo_keywords TEXT');
    }
    if (!columns.includes('seo_description')) {
      db.exec('ALTER TABLE site_config ADD COLUMN seo_description TEXT');
    }
    if (!columns.includes('custom_css')) {
      db.exec('ALTER TABLE site_config ADD COLUMN custom_css TEXT');
    }
    if (!columns.includes('custom_js')) {
      db.exec('ALTER TABLE site_config ADD COLUMN custom_js TEXT');
    }
  } catch (error) {
    console.warn('数据库迁移警告:', error.message);
  }

  // 主播信息表
  db.exec(`
    CREATE TABLE IF NOT EXISTS streamer (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      bilibili_url TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ 数据库初始化完成');
}

// 检查是否已安装（是否有管理员账号）
export function isInstalled() {
  const stmt = db.prepare('SELECT COUNT(*) as count FROM admin');
  const result = stmt.get();
  return result.count > 0;
}

// 获取站点配置
export function getSiteConfig() {
  const stmt = db.prepare('SELECT * FROM site_config WHERE id = 1');
  return stmt.get();
}

export default db;

