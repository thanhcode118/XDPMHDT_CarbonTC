export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  loginUrl: import.meta.env.VITE_LOGIN_URL || 'http://localhost:5173/login',
  adminAppUrl: import.meta.env.VITE_ADMIN_APP_URL || 'http://localhost:5174',
  appName: 'Carbon Credit Admin',
  version: '1.0.0',
};
