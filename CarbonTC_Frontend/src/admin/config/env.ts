// export const config = {
//   apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
//   loginUrl: import.meta.env.VITE_LOGIN_URL || 'http://localhost:5173/login',
//   adminAppUrl: import.meta.env.VITE_ADMIN_APP_URL || 'http://localhost:5173',
//   appName: 'Carbon Credit Admin',
//   version: '1.0.0',
// };

// ============================================
// Environment Configuration for Admin Service
// ============================================

export const config = {
  // Admin Service (Port 5005) - Service chính của Admin FE
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000',

  // Auth Service (Port 5001) - Xác thực & quản lý users
  authServiceUrl: import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:5001/api',

  // Other Services (Optional - for future direct calls)
  carbonServiceUrl: import.meta.env.VITE_CARBON_SERVICE_URL || 'http://localhost:5002/api',
  marketplaceServiceUrl: import.meta.env.VITE_MARKETPLACE_SERVICE_URL || 'http://localhost:7000/api',
  walletServiceUrl: import.meta.env.VITE_WALLET_SERVICE_URL || 'http://localhost:5004/api',

  // App URLs
  loginUrl: import.meta.env.VITE_LOGIN_URL || 'http://localhost:5173/login',
  adminAppUrl: import.meta.env.VITE_ADMIN_APP_URL || 'http://localhost:5173',
  adminBasePath: import.meta.env.VITE_ADMIN_BASE_PATH || '/admin',

  // App Info
  appName: import.meta.env.VITE_APP_NAME || 'Carbon Credit Admin',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  env: import.meta.env.VITE_ENV || 'development',

  // Feature Flags
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const;

// Type-safe config access
export type Config = typeof config;

// Helper functions
export const getServiceUrl = (service: 'admin' | 'auth' | 'carbon' | 'marketplace' | 'wallet'): string => {
  const serviceMap = {
    admin: config.apiBaseUrl,
    auth: config.authServiceUrl,
    carbon: config.carbonServiceUrl,
    marketplace: config.marketplaceServiceUrl,
    wallet: config.walletServiceUrl,
  };
  return serviceMap[service];
};

// Log config in development
if (config.isDevelopment) {
  console.log('🔧 [Config] Environment Configuration:');
  console.log('  - Admin Service:', config.apiBaseUrl);
  console.log('  - Auth Service:', config.authServiceUrl);
  console.log('  - Environment:', config.env);
  console.log('  - Base Path:', config.adminBasePath);
}

export default config;
