// src/utils/auth.js

const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_info';

export const authUtils = {
  // Lưu token sau khi login
  setTokens(accessToken, refreshToken) {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  // Lấy access token
  getAccessToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Lấy refresh token
  getRefreshToken() {
    return localStorage.setItem(REFRESH_TOKEN_KEY);
  },

  // Lưu thông tin user
  setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  // Lấy thông tin user
  getUser() {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  // Xóa tất cả thông tin (logout)
  clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  // Kiểm tra đã login chưa
  isAuthenticated() {
    return !!this.getAccessToken();
  }
};