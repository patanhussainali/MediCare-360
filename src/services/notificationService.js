import { getItem, setItem, STORAGE_KEYS } from '../utils/storage';
import { mockApiCall } from './apiClient';

export const notificationService = {
  createNotification({ userId, title, message, type = 'GENERAL' }) {
    try {
      const notifications = getItem(STORAGE_KEYS.NOTIFICATIONS, []);
      const newNotif = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        userId: userId || 'GLOBAL',
        title,
        message,
        type, // 'APPOINTMENT' | 'PRESCRIPTION' | 'BILLING' | 'SYSTEM'
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      notifications.unshift(newNotif);
      setItem(STORAGE_KEYS.NOTIFICATIONS, notifications);
      return newNotif;
    } catch (e) {
      console.error('Failed to create notification', e);
    }
  },

  async getUserNotifications(userId, role) {
    return mockApiCall(() => {
      const notifications = getItem(STORAGE_KEYS.NOTIFICATIONS, []);
      return notifications.filter(n => n.userId === userId || n.userId === 'GLOBAL' || (role === 'ADMIN' && n.type === 'SYSTEM'));
    });
  },

  async markAsRead(notificationId) {
    return mockApiCall(() => {
      const notifications = getItem(STORAGE_KEYS.NOTIFICATIONS, []);
      const index = notifications.findIndex(n => n.id === notificationId);
      if (index !== -1) {
        notifications[index].isRead = true;
        setItem(STORAGE_KEYS.NOTIFICATIONS, notifications);
      }
      return { success: true };
    });
  },

  async markAllAsRead(userId) {
    return mockApiCall(() => {
      const notifications = getItem(STORAGE_KEYS.NOTIFICATIONS, []);
      const updated = notifications.map(n => {
        if (n.userId === userId || n.userId === 'GLOBAL') {
          return { ...n, isRead: true };
        }
        return n;
      });
      setItem(STORAGE_KEYS.NOTIFICATIONS, updated);
      return { success: true };
    });
  }
};
