import axiosClient from '../../../api/axiosClient';

export interface NotificationResponse {
  id: number;
  title: string;
  message: string | null;
  type: string | null;
  read: boolean;
  createdAt: string;
}

export const notificationApi = {
  getMyNotifications: async (): Promise<NotificationResponse[]> => {
    const response = await axiosClient.get<NotificationResponse[]>('/notifications');
    return response.data;
  },
  getUnreadCount: async (): Promise<number> => {
    const response = await axiosClient.get<{ count: number } | number>('/notifications/unread-count');
    // Backend returns { count: N }, but tolerate raw number too in case the contract changes.
    const data = response.data as { count: number } | number;
    if (typeof data === 'number') return data;
    return data?.count ?? 0;
  },
  markRead: async (id: number): Promise<NotificationResponse> => {
    const response = await axiosClient.put<NotificationResponse>(`/notifications/${id}/read`);
    return response.data;
  },
  markAllRead: async (): Promise<number> => {
    const response = await axiosClient.put<{ updated: number }>('/notifications/read-all');
    return response.data.updated;
  },
};
