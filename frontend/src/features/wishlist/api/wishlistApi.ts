import axiosClient from '../../../api/axiosClient';

export interface WishlistResponse {
  id: number;
  bookId: number;
  bookTitle: string;
  bookAuthor: string;
  bookStatus: 'AVAILABLE' | 'BORROWED';
  addedAt: string;
}

export const wishlistApi = {
  addToWishlist: async (bookId: number): Promise<WishlistResponse> => {
    const response = await axiosClient.post<WishlistResponse>(`/wishlist/${bookId}`);
    return response.data;
  },
  removeFromWishlist: async (bookId: number): Promise<void> => {
    await axiosClient.delete(`/wishlist/${bookId}`);
  },
  getMyWishlist: async (): Promise<WishlistResponse[]> => {
    const response = await axiosClient.get<WishlistResponse[]>('/wishlist');
    return response.data;
  },
  checkInWishlist: async (bookId: number): Promise<boolean> => {
    const response = await axiosClient.get<{ inWishlist: boolean }>(`/wishlist/${bookId}/check`);
    return response.data.inWishlist;
  },
};
