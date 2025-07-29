import React, { createContext, useContext, ReactNode } from 'react';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';

interface NotificationContextType {
  notifications: ReturnType<typeof useNotificationSystem>['notifications'];
  unreadCount: number;
  addNotification: ReturnType<typeof useNotificationSystem>['addNotification'];
  markAsRead: ReturnType<typeof useNotificationSystem>['markAsRead'];
  markAllAsRead: ReturnType<typeof useNotificationSystem>['markAllAsRead'];
  clearNotification: ReturnType<typeof useNotificationSystem>['clearNotification'];
  clearAll: ReturnType<typeof useNotificationSystem>['clearAll'];
  processLeadChanges: ReturnType<typeof useNotificationSystem>['processLeadChanges'];
  processTaskReminders: ReturnType<typeof useNotificationSystem>['processTaskReminders'];
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const notificationSystem = useNotificationSystem();

  return (
    <NotificationContext.Provider value={notificationSystem}>
      {children}
    </NotificationContext.Provider>
  );
};