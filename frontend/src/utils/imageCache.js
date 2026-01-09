// 图片缓存工具

const CACHE_PREFIX = 'img_cache_';
const CACHE_VERSION = '1.0';

// 将图片URL转换为缓存键
function getCacheKey(url) {
  return `${CACHE_PREFIX}${btoa(url).replace(/[^a-zA-Z0-9]/g, '')}`;
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
        } catch (e) {
          // 如果存储空间不足，返回原URL
          console.warn('图片缓存失败，存储空间可能不足:', e);
        }
        resolve(base64data);
      };
      reader.onerror = () => {
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

