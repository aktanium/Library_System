import axiosClient from '../../../api/axiosClient';

export interface ReviewRequest {
  rating: number;
  comment: string;
}

export interface ReviewResponse {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  userName: string;
  userId: number;
  bookId: number;
  bookTitle: string;
}

export interface BookRatingStats {
  average: number;
  count: number;
}

export const reviewApi = {
  addReview: async (bookId: number, request: ReviewRequest): Promise<ReviewResponse> => {
    const response = await axiosClient.post<ReviewResponse>(`/reviews/book/${bookId}`, request);
    return response.data;
  },
  getBookReviews: async (bookId: number): Promise<ReviewResponse[]> => {
    const response = await axiosClient.get<ReviewResponse[]>(`/reviews/book/${bookId}`);
    return response.data;
  },
  deleteReview: async (reviewId: number): Promise<void> => {
    await axiosClient.delete(`/reviews/${reviewId}`);
  },
  getAllAverages: async (): Promise<Record<number, BookRatingStats>> => {
    const response = await axiosClient.get<Record<number, BookRatingStats>>('/reviews/averages');
    return response.data;
  },
};
