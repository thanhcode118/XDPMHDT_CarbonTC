export type ThemeMode = 'light' | 'dark';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  timestamp: number;
  duration?: number;
}

export interface UIState {
  themeMode: ThemeMode;
  sidebarOpen: boolean;
  notifications: Notification[];

  toggleSidebar: () => void;
  toggleTheme: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setThemeMode: (mode: ThemeMode) => void;
  showNotification: (
    message: string,
    type: NotificationType,
    duration?: number,
  ) => void;

  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}
