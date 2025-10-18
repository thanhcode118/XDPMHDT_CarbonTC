/* eslint-disable no-unused-vars */
export type UserRole = 'ADMIN' | 'BUYER' | 'EV_OWNER' | 'CVA';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface AuthState {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  themeMode: any;
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

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
