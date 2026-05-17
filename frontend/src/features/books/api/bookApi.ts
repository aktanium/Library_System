import axiosClient from '../../../api/axiosClient';
import type { Book } from '../../../types/book';

export const bookApi = {
  getAllBooks: async (): Promise<Book[]> => {
    const response = await axiosClient.get('/books');
    return response.data;
  },
  searchBooks: async (keyword: string): Promise<Book[]> => {
    const response = await axiosClient.get(`/books/search?keyword=${encodeURIComponent(keyword)}`);
    return response.data;
  }
};
