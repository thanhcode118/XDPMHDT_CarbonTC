import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type {
  Notification,
  NotificationType,
  ThemeMode,
  UIState,
} from '../types';

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      sidebarOpen: true,
      themeMode: 'light',
      notifications: [],

      toggleSidebar: () => {
        set((state: { sidebarOpen: boolean }) => ({
          sidebarOpen: !state.sidebarOpen,
        }));
      },

      setSidebarOpen: (isOpen: boolean) => {
        set({ sidebarOpen: isOpen });
      },

      setThemeMode: (mode: ThemeMode) => {
        set({ themeMode: mode });
      },

      toggleTheme: () => {
        set((state) => ({
          themeMode: state.themeMode === 'light' ? 'dark' : 'light',
        }));
      },

      showNotification: (
        message: string,
        type: NotificationType,
        duration = 5000,
      ) => {
        const id = `notification-${Date.now()}-${Math.random()}`;
        const notification: Notification = {
          id,
          message,
          type,
          timestamp: Date.now(),
          duration,
        };

        set((state) => ({
          notifications: [...state.notifications, notification],
        }));

        if (duration > 0) {
          setTimeout(() => {
            get().removeNotification(id);
          }, duration);
        }
      },

      removeNotification: (id: string) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },
    }),
    {
      name: 'admin-ui-storage',
      partialize: (state) => ({
        themeMode: state.themeMode,
        sidebarOpen: state.sidebarOpen,
      }),
    },
  ),
);

export const selectThemeMode = (state: UIState) => state.themeMode;
export const selectSidebarOpen = (state: UIState) => state.sidebarOpen;
export const selectNotifications = (state: UIState) => state.notifications;
