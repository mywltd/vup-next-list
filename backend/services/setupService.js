import bcrypt from 'bcrypt';
import { db } from '../db/init.js';

export class SetupService {
  // 执行初始安装
  static async install(setupData) {
    const {
      siteName,
      defaultPlaylistName,
      avatarUrl,
      backgroundUrl,
      adminUsername,
      adminPassword,
      streamerName,
      bilibiliUrl,
      themeConfig
    } = setupData;

    try {
      // 开始事务
      db.exec('BEGIN TRANSACTION');

      // 1. 创建管理员账号
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      const insertAdmin = db.prepare(
        'INSERT INTO admin (username, password_hash) VALUES (?, ?)'
      );
      insertAdmin.run(adminUsername, passwordHash);

      // 2. 创建站点配置
      const insertSiteConfig = db.prepare(`
        INSERT INTO site_config (
          id, site_name, site_subtitle, default_playlist_name, avatar_url, 
          background_url, theme_config_json, seo_keywords, seo_description,
          custom_css, custom_js
        ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insertSiteConfig.run(
        siteName,
        setupData.siteSubtitle || '',
        defaultPlaylistName,
        avatarUrl || '',
        backgroundUrl || '',
        JSON.stringify(themeConfig || {}),
        setupData.seoKeywords || '',
        setupData.seoDescription || '',
        '',
        ''
      );

      // 3. 创建主播信息
      const insertStreamer = db.prepare(
        'INSERT INTO streamer (name, bilibili_url) VALUES (?, ?)'
      );
      insertStreamer.run(streamerName, bilibiliUrl);

      // 提交事务
      db.exec('COMMIT');

      return { success: true, message: '安装成功' };
    } catch (error) {
      // 回滚事务
      db.exec('ROLLBACK');
      console.error('安装失败:', error);
      throw new Error('安装失败: ' + error.message);
    }
  }

  // 获取安装状态
  static getInstallStatus() {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM admin');
    const result = stmt.get();
    return {
      installed: result.count > 0
    };
  }
}

