import { db } from '../db/init.js';

export class SiteService {
  // 获取站点元数据
  static getMeta() {
    const siteConfigStmt = db.prepare('SELECT * FROM site_config WHERE id = 1');
    const siteConfig = siteConfigStmt.get();

    const streamerStmt = db.prepare('SELECT * FROM streamer ORDER BY id LIMIT 1');
    const streamer = streamerStmt.get();

    if (!siteConfig) {
      return null;
    }

    return {
      siteName: siteConfig.site_name,
      siteSubtitle: siteConfig.site_subtitle || '',
      defaultPlaylistName: siteConfig.default_playlist_name,
      avatarUrl: siteConfig.avatar_url || '',
      backgroundUrl: siteConfig.background_url || '',
      themeConfig: siteConfig.theme_config_json ? JSON.parse(siteConfig.theme_config_json) : {},
      seoKeywords: siteConfig.seo_keywords || '',
      seoDescription: siteConfig.seo_description || '',
      customCss: siteConfig.custom_css || '',
      customJs: siteConfig.custom_js || '',
      hiddenTitle: siteConfig.hidden_title || '',
      copyMode: siteConfig.copy_mode || 'normal',
      hcaptchaEnabled: Boolean(siteConfig.hcaptcha_enabled),
      hcaptchaSiteKey: siteConfig.hcaptcha_site_key || '',
      streamer: streamer ? {
        name: streamer.name,
        bilibiliUrl: streamer.bilibili_url
      } : null
    };
  }

  // 更新站点配置
  static updateSiteConfig(configData) {
    const {
      siteName,
      siteSubtitle,
      defaultPlaylistName,
      avatarUrl,
      backgroundUrl,
      themeConfig,
      seoKeywords,
      seoDescription,
      customCss,
      customJs,
      hiddenTitle,
      copyMode,
      hcaptchaEnabled,
      hcaptchaSiteKey,
      hcaptchaSecretKey
    } = configData;

    const stmt = db.prepare(`
      UPDATE site_config 
      SET site_name = ?, 
          site_subtitle = ?,
          default_playlist_name = ?, 
          avatar_url = ?, 
          background_url = ?,
          theme_config_json = ?,
          seo_keywords = ?,
          seo_description = ?,
          custom_css = ?,
          custom_js = ?,
          hidden_title = ?,
          copy_mode = ?,
          hcaptcha_enabled = ?,
          hcaptcha_site_key = ?,
          hcaptcha_secret_key = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `);

    stmt.run(
      siteName,
      siteSubtitle || '',
      defaultPlaylistName,
      avatarUrl || '',
      backgroundUrl || '',
      JSON.stringify(themeConfig || {}),
      seoKeywords || '',
      seoDescription || '',
      customCss || '',
      customJs || '',
      hiddenTitle || '',
      copyMode || 'normal',
      hcaptchaEnabled ? 1 : 0,
      hcaptchaSiteKey || '',
      hcaptchaSecretKey || ''
    );

    return { success: true, message: '站点配置更新成功' };
  }

  // 更新主播信息
  static updateStreamer(streamerData) {
    const { name, bilibiliUrl } = streamerData;

    // 先检查是否存在主播记录
    const checkStmt = db.prepare('SELECT COUNT(*) as count FROM streamer');
    const { count } = checkStmt.get();

    if (count === 0) {
      // 插入新记录
      const insertStmt = db.prepare('INSERT INTO streamer (name, bilibili_url) VALUES (?, ?)');
      insertStmt.run(name, bilibiliUrl);
    } else {
      // 更新第一条记录
      const updateStmt = db.prepare(`
        UPDATE streamer 
        SET name = ?, bilibili_url = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = (SELECT id FROM streamer ORDER BY id LIMIT 1)
      `);
      updateStmt.run(name, bilibiliUrl);
    }

    return { success: true, message: '主播信息更新成功' };
  }
}

