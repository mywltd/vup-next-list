// 复制到剪贴板
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // 降级方案
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        textArea.remove();
        return true;
      } catch (error) {
        console.error('复制失败:', error);
        textArea.remove();
        return false;
      }
    }
  } catch (error) {
    console.error('复制失败:', error);
    return false;
  }
};

// 防抖函数
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// 下载文件
export const downloadFile = (data, filename) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// 格式化日期
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

// 获取首字母颜色
export const getLetterColor = (letter) => {
  const colors = [
    '#FF6B9D', '#7B68EE', '#64B5F6', '#81C784',
    '#FFB74D', '#E57373', '#BA68C8', '#4DD0E1',
  ];
  const index = letter.charCodeAt(0) % colors.length;
  return colors[index];
};

// 验证 URL
export const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

// 生成唯一 ID
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// 获取文件扩展名
export const getFileExtension = (filename) => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
};

// 验证图片文件
export const isValidImage = (file) => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(file.type);
};

// 格式化文件大小
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// 检测是否为微信浏览器
export const isWeChatBrowser = () => {
  const ua = navigator.userAgent.toLowerCase();
  return /micromessenger/.test(ua);
};

// 检测是否为低性能环境（微信、QQ等内置浏览器）
export const isLowPerformanceEnv = () => {
  const ua = navigator.userAgent.toLowerCase();
  return /micromessenger|qq\//.test(ua);
};

// 获取优化的背景样式（根据环境）
export const getOptimizedBackdropStyle = (isDark, isLowPerf = isLowPerformanceEnv()) => {
  if (isLowPerf) {
    // 低性能环境：禁用 backdrop-filter，使用纯色背景
    return {
      backgroundColor: isDark
        ? 'rgba(20, 25, 45, 0.95)' // 提高不透明度
        : 'rgba(255, 255, 255, 0.95)',
    };
  }
  // 高性能环境：使用完整的玻璃效果
  return {
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    backgroundColor: isDark
      ? 'rgba(20, 25, 45, 0.7)'
      : 'rgba(255, 255, 255, 0.7)',
  };
};

export default {
  copyToClipboard,
  debounce,
  downloadFile,
  formatDate,
  getLetterColor,
  isValidUrl,
  generateId,
  getFileExtension,
  isValidImage,
  formatFileSize,
  isWeChatBrowser,
  isLowPerformanceEnv,
  getOptimizedBackdropStyle,
};

