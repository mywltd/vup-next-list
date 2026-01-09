import axios from 'axios';

// 获取 API 基础 URL
// 优先级：环境变量 > 生产环境使用相对路径 > 开发环境使用 localhost
const getApiBaseUrl = () => {
  // 如果设置了环境变量，直接使用
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // 生产环境：使用相对路径（自动使用当前域名）
  if (import.meta.env.PROD) {
    return '';
  }
  
  // 开发环境：使用 localhost
  return 'http://localhost:3001';
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 如果是FormData，删除Content-Type header，让浏览器自动设置（包括boundary）
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    // 添加JWT token到请求头
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.error || '请求失败';
    
    // 如果是401错误（未授权），清除token并跳转到登录页
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      // 只在非登录页面时跳转
      if (!window.location.pathname.includes('/admin/login')) {
        window.location.href = '/admin/login';
      }
    }
    
    console.error('API Error:', message);
    return Promise.reject(new Error(message));
  }
);

// API 方法
export const setupAPI = {
  // 检查安装状态
  getStatus: () => api.get('/api/setup/status'),
  
  // 执行安装
  install: (data) => api.post('/api/setup/install', data),
};

export const authAPI = {
  // 登录
  login: (username, password, hcaptchaToken = null) => 
    api.post('/api/auth/login', { username, password, hcaptchaToken }),
  
  // 退出
  logout: () => api.post('/api/auth/logout'),
  
  // 检查登录状态
  getStatus: () => api.get('/api/auth/status'),
  
  // 获取 hCaptcha 配置
  getHCaptchaConfig: () => api.get('/api/auth/hcaptcha-config'),
  
  // 修改密码
  changePassword: (oldPassword, newPassword) =>
    api.post('/api/auth/change-password', { oldPassword, newPassword }),
};

export const playlistAPI = {
  // 获取歌单列表
  getPlaylist: (params) => api.get('/api/playlist', { params }),
  
  // 获取语种列表
  getLanguages: () => api.get('/api/playlist/languages'),
  
  // 获取首字母列表
  getFirstLetters: () => api.get('/api/playlist/first-letters'),
  
  // 获取标签云数据
  getTagCloud: () => api.get('/api/playlist/tag-cloud'),
  
  // 添加歌曲
  addSong: (data) => api.post('/api/playlist/add', data),
  
  // 更新歌曲
  updateSong: (id, data) => api.put(`/api/playlist/edit/${id}`, data),
  
  // 删除歌曲
  deleteSong: (id) => api.delete(`/api/playlist/delete/${id}`),
  
  // 导入歌单
  importPlaylist: (songs, clearExisting = false) =>
    api.post('/api/playlist/import', { songs, clearExisting }),
  
  // 导出歌单
  exportPlaylist: () => api.get('/api/playlist/export'),
  
  // 清空歌单
  clearPlaylist: () => api.delete('/api/playlist/clear'),
};

export const siteAPI = {
  // 获取站点元数据
  getMeta: () => api.get('/api/site/meta'),
  
  // 更新站点配置
  updateConfig: (data) => api.put('/api/site/config', data),
  
  // 更新主播信息
  updateStreamer: (data) => api.put('/api/site/streamer', data),
  
  // 上传文件
  uploadFile: (file) => {
    if (!file) {
      return Promise.reject(new Error('请选择文件'));
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    // 请求拦截器会自动处理FormData的Content-Type
    return api.post('/api/site/upload', formData);
  },
};

export default api;

