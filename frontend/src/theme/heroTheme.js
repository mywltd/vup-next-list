/**
 * HeroUI 主题配置 - 将原有 anime 风格配色映射到 CSS 变量
 * 供 Tailwind 与 HeroUI 组件使用
 */

/** 将 hex 转为 HSL 字符串 (h s% l%)，HeroUI 期望此格式 */
function hexToHsl(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '212 100% 67%'; // 默认蓝
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      default: h = ((r - g) / d + 4) / 6; break;
    }
  }
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);
  return `${h} ${s}% ${l}%`;
}

/**
 * 应用主题变量到 document
 * @param {string} mode - 'light' | 'dark'
 * @param {object} customConfig - { primaryColor?, secondaryColor? }
 */
export function applyHeroTheme(mode, customConfig = {}) {
  const primaryColor = customConfig.primaryColor || '#6EC1E4';
  const secondaryColor = customConfig.secondaryColor || '#FFB6C1';
  const root = document.documentElement;

  // HeroUI 使用 HSL 格式的 CSS 变量
  root.style.setProperty('--heroui-primary', hexToHsl(primaryColor));
  root.style.setProperty('--heroui-secondary', hexToHsl(secondaryColor));

  // 深色模式：在 html 上添加 dark 类
  if (mode === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}
