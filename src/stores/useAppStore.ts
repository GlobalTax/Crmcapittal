import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface AppState {
  // Global app state
  isInitialized: boolean;
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  
  // Performance tracking
  renderCount: number;
  lastRender: number;
  
  // Feature flags
  features: {
    newDashboard: boolean;
    enhancedSearch: boolean;
    aiInsights: boolean;
  };
  
  // Global notifications
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: number;
    read: boolean;
  }>;
}

interface AppActions {
  // Initialization
  initialize: () => void;
  
  // Theme management
  setTheme: (theme: AppState['theme']) => void;
  
  // UI state
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  // Performance tracking
  incrementRenderCount: () => void;
  updateLastRender: () => void;
  
  // Feature flags
  toggleFeature: (feature: keyof AppState['features']) => void;
  
  // Notifications
  addNotification: (notification: Omit<AppState['notifications'][0], 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useAppStore = create<AppState & AppActions>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set, get) => ({
          // Initial state
          isInitialized: false,
          theme: 'system',
          sidebarCollapsed: false,
          renderCount: 0,
          lastRender: Date.now(),
          features: {
            newDashboard: true,
            enhancedSearch: true,
            aiInsights: false,
          },
          notifications: [],

          // Actions
          initialize: () => {
            set((state) => {
              state.isInitialized = true;
              state.lastRender = Date.now();
            });
          },

          setTheme: (theme) => {
            set((state) => {
              state.theme = theme;
            });
          },

          setSidebarCollapsed: (collapsed) => {
            set((state) => {
              state.sidebarCollapsed = collapsed;
            });
          },

          incrementRenderCount: () => {
            set((state) => {
              state.renderCount += 1;
            });
          },

          updateLastRender: () => {
            set((state) => {
              state.lastRender = Date.now();
            });
          },

          toggleFeature: (feature) => {
            set((state) => {
              state.features[feature] = !state.features[feature];
            });
          },

          addNotification: (notification) => {
            set((state) => {
              const id = `notification-${Date.now()}-${Math.random()}`;
              state.notifications.unshift({
                ...notification,
                id,
                timestamp: Date.now(),
                read: false,
              });
              
              // Keep only last 50 notifications
              if (state.notifications.length > 50) {
                state.notifications = state.notifications.slice(0, 50);
              }
            });
          },

          markNotificationRead: (id) => {
            set((state) => {
              const notification = state.notifications.find(n => n.id === id);
              if (notification) {
                notification.read = true;
              }
            });
          },

          removeNotification: (id) => {
            set((state) => {
              state.notifications = state.notifications.filter(n => n.id !== id);
            });
          },

          clearNotifications: () => {
            set((state) => {
              state.notifications = [];
            });
          },
        }))
      ),
      {
        name: 'crm-app-store',
        partialize: (state) => ({
          theme: state.theme,
          sidebarCollapsed: state.sidebarCollapsed,
          features: state.features,
        }),
      }
    ),
    {
      name: 'app-store',
    }
  )
);

// Selectors for optimized subscriptions
export const useAppInitialized = () => useAppStore((state) => state.isInitialized);
export const useAppTheme = () => useAppStore((state) => state.theme);
export const useSidebarCollapsed = () => useAppStore((state) => state.sidebarCollapsed);
export const useNotifications = () => useAppStore((state) => state.notifications);
export const useUnreadNotifications = () => 
  useAppStore((state) => state.notifications.filter(n => !n.read));
