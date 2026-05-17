import axiosClient from '../../../api/axiosClient';
import type { DashboardData, User } from '../types';
import type { BorrowRecordResponse } from '../../borrow/types';

export const adminApi = {
  getDashboard: async (): Promise<DashboardData> => {
    const response = await axiosClient.get('/admin/dashboard');
    return response.data;
  },
  getAllUsers: async (): Promise<User[]> => {
    const response = await axiosClient.get('/admin/users');
    return response.data;
  },
  getUserById: async (id: number): Promise<User> => {
    const response = await axiosClient.get(`/admin/users/${id}`);
    return response.data;
  },
  changeUserRole: async (userId: number, role: string): Promise<void> => {
    await axiosClient.put(`/admin/users/${userId}/role`, { role });
  },
  getAllBorrows: async (): Promise<BorrowRecordResponse[]> => {
    const response = await axiosClient.get('/borrow/all');
    return response.data;
  },
  getUserBorrowHistory: async (userId: number): Promise<BorrowRecordResponse[]> => {
    const response = await axiosClient.get(`/admin/users/${userId}/borrow-history`);
    return response.data;
  },
};
