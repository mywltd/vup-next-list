import { getSiteConfig } from '../db/init.js';

export class HCaptchaService {
  // 验证 hCaptcha token
  static async verify(token, remoteIp = null) {
    try {
      const siteConfig = getSiteConfig();
      
      // 如果未启用 hCaptcha，直接返回成功
      if (!siteConfig || !siteConfig.hcaptcha_enabled) {
        return { success: true, message: 'hCaptcha未启用' };
      }

      const secretKey = siteConfig.hcaptcha_secret_key;
      if (!secretKey) {
        throw new Error('hCaptcha密钥未配置');
      }

      if (!token) {
        throw new Error('hCaptcha验证码不能为空');
      }

      // 调用 hCaptcha 验证API
      const verifyUrl = 'https://hcaptcha.com/siteverify';
      const params = new URLSearchParams({
        secret: secretKey,
        response: token,
        ...(remoteIp && { remoteip: remoteIp })
      });

      const response = await fetch(verifyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      const data = await response.json();

      if (data.success) {
        return { success: true, message: 'hCaptcha验证成功' };
      } else {
        console.warn('hCaptcha验证失败:', data['error-codes']);
        throw new Error('hCaptcha验证失败，请重试');
      }
    } catch (error) {
      console.error('hCaptcha验证错误:', error);
      throw new Error(error.message || 'hCaptcha验证失败');
    }
  }

  // 检查 hCaptcha 是否启用
  static isEnabled() {
    const siteConfig = getSiteConfig();
    return siteConfig && Boolean(siteConfig.hcaptcha_enabled);
  }
}

