import axiosClient from '../../../api/axiosClient';
import type { Book } from '../../../types/book';

export interface BookRequest {
  title: string;
  author: string;
  genre: string;
  isbn: string;
  quantity: number;
}

export const bookAdminApi = {
  createBook: async (data: BookRequest): Promise<Book> => {
    const response = await axiosClient.post<Book>('/books', data);
    return response.data;
  },
  updateBook: async (id: number, data: BookRequest): Promise<Book> => {
    const response = await axiosClient.put<Book>(`/books/${id}`, data);
    return response.data;
  },
  deleteBook: async (id: number): Promise<void> => {
    await axiosClient.delete(`/books/${id}`);
  },
};
