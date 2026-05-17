export interface DashboardData {
  totalBooks: number;
  availableBooks: number;
  borrowedBooks: number;
  totalUsers: number;
  activeBorrowRecords: number;
  returnedBorrowRecords: number;
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: string;
}
