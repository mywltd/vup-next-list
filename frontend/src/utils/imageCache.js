// 图片缓存工具

const CACHE_PREFIX = 'img_cache_';
const CACHE_VERSION = '1.0';
// 将图片URL转换为缓存键
function getCacheKey(url) {
  return `${CACHE_PREFIX}${btoa(url).replace(/[^a-zA-Z0-9]/g, '')}`;
}

// 配额不足时清除最旧的若干缓存项
function evictOldestCache() {
  const keys = Object.keys(localStorage).filter((k) => k.startsWith(CACHE_PREFIX));
  if (keys.length === 0) return;
  const entries = keys.map((k) => {
    try {
      const data = JSON.parse(localStorage.getItem(k) || '{}');
      return { key: k, ts: data.timestamp || 0 };
    } catch {
      return { key: k, ts: 0 };
    }
  });
  entries.sort((a, b) => a.ts - b.ts);
  entries.slice(0, Math.min(3, entries.length)).forEach((e) => localStorage.removeItem(e.key));
}

// 将图片转换为base64并缓存
export async function cacheImage(url) {
  if (!url) return url;
  
  // 检查是否已经缓存
  const cacheKey = getCacheKey(url);
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      const cacheData = JSON.parse(cached);
      // 检查缓存版本
      if (cacheData.version === CACHE_VERSION) {
        return cacheData.data;
      }
    } catch (e) {
      // 缓存损坏，删除
      localStorage.removeItem(cacheKey);
    }
  }

  try {
    // 获取图片并转换为base64
    const response = await fetch(url);
    if (!response.ok) {
      return url; // 如果获取失败，返回原URL
    }
    
    const blob = await response.blob();
    const reader = new FileReader();
    
    return new Promise((resolve) => {
      reader.onloadend = () => {
        const base64data = reader.result;
        // 缓存base64数据
        try {
          localStorage.setItem(cacheKey, JSON.stringify({
            version: CACHE_VERSION,
            data: base64data,
            timestamp: Date.now(),
          }));
          resolve(base64data);
        } catch (e) {
          if (e.name === 'QuotaExceededError' && base64data) {
            evictOldestCache();
            try {
              localStorage.setItem(cacheKey, JSON.stringify({
                version: CACHE_VERSION,
                data: base64data,
                timestamp: Date.now(),
              }));
              resolve(base64data);
              return;
            } catch (_) {}
          }
          console.warn('图片缓存失败，存储空间可能不足，将使用原始 URL:', e.message);
          resolve(url);
        }
      };
      reader.onerror = () => {
        console.warn('图片转换失败，将使用原始 URL');
        resolve(url); // 转换失败，返回原URL
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('图片缓存错误:', error);
    return url; // 出错时返回原URL
  }
}

// 获取缓存的图片（如果存在）
export function getCachedImage(url) {
  if (!url) return url;
  
  const cacheKey = getCacheKey(url);
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      const cacheData = JSON.parse(cached);
      if (cacheData.version === CACHE_VERSION) {
        return cacheData.data;
      }
    } catch (e) {
      localStorage.removeItem(cacheKey);
    }
  }
  return null;
}

// 清除所有图片缓存
export function clearImageCache() {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith(CACHE_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
}

// 获取缓存大小（估算）
export function getCacheSize() {
  const keys = Object.keys(localStorage);
  let size = 0;
  keys.forEach(key => {
    if (key.startsWith(CACHE_PREFIX)) {
      size += localStorage.getItem(key).length;
    }
  });
  return size;
}

