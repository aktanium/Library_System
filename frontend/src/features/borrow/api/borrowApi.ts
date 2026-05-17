import axiosClient from '../../../api/axiosClient';
import type { BorrowRecordResponse } from '../types';

export const borrowApi = {
  borrowBook: async (bookId: number): Promise<void> => {
    await axiosClient.post(`/borrow/${bookId}`);
  },
  returnBook: async (recordId: number): Promise<void> => {
    await axiosClient.post(`/borrow/return/${recordId}`);
  },
  getMyBorrowHistory: async (): Promise<BorrowRecordResponse[]> => {
    const response = await axiosClient.get('/borrow/history');
    return response.data;
  }
};
