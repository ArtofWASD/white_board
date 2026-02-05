
import { useAuthStore } from '../store/useAuthStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const getAuthHeader = () => {
    const token = useAuthStore.getState().token;
    return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
};

export interface Notification {
  id: string;
  userId: string;
  type: string; // 'LIKE' | 'COMMENT'
  title?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: any;
}

export const getNotifications = async (): Promise<Notification[]> => {
  try {
    const response = await fetch(`${API_URL}/api/notifications`, {
      headers: getAuthHeader(),
    });
    
    if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
            return data;
        } else {
            console.error('Unexpected notifications response format:', data);
            return [];
        }
    } else {
        console.error('Failed to fetch notifications:', response.status);
        return [];
    }
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

export const getUnreadNotificationCount = async (): Promise<number> => {
    try {
        const response = await fetch(`${API_URL}/api/notifications/unread-count`, {
            headers: getAuthHeader(),
        });
        if (response.ok) {
            const data = await response.json();
            return data.count;
        }
        return 0;
    } catch (error) {
        console.error('Error fetching unread count:', error);
        return 0;
    }
}

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    await fetch(`${API_URL}/api/notifications/${notificationId}/read`, {
      method: 'PATCH',
      headers: getAuthHeader(),
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  try {
    await fetch(`${API_URL}/api/notifications/read-all`, {
      method: 'PATCH',
      headers: getAuthHeader(),
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
  }
};
