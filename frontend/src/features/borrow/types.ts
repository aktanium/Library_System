export interface BorrowRecordResponse {
  id: number;
  bookId: number;
  bookTitle: string;
  bookIsbn: string;
  userFullName: string;
  userEmail: string;
  borrowDate: string;
  returnDate: string | null;
  status: 'BORROWED' | 'RETURNED';
}
