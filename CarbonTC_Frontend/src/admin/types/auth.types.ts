/* eslint-disable no-unused-vars */
export type UserRole = 'ADMIN' | 'BUYER' | 'EV_OWNER' | 'CVA';
export type ThemeMode = 'light' | 'dark';

export interface User {
  id: string;
  userId?: string;
  name?: string | null;
  fullName?: string | null | undefined;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface AuthState {
  themeMode: ThemeMode;
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  checkAuth: () => Promise<boolean> | boolean;
  setLoading: (loading: boolean) => void;
  setToken: (token: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  login: (token: string, refreshToken: string, user: User) => void;
  logout: () => void;
  clearAuth: () => void;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}
