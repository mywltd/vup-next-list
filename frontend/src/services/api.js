import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

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
  login: (username, password) => api.post('/api/auth/login', { username, password }),
  
  // 退出
  logout: () => api.post('/api/auth/logout'),
  
  // 检查登录状态
  getStatus: () => api.get('/api/auth/status'),
  
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
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/site/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default api;

