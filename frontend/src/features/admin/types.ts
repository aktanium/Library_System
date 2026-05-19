export interface DashboardData {
  totalBooks: number;
  availableBooks: number;
  borrowedBooks: number;
  totalUsers: number;
  overdueCount: number;
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: string;
}
