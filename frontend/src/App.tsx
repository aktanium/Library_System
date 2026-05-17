import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import BooksPage from './features/books/pages/BooksPage';
import BorrowHistoryPage from './features/borrow/pages/BorrowHistoryPage';
import DashboardPage from './features/admin/pages/DashboardPage';
import UsersPage from './features/admin/pages/UsersPage';
import AdminBooksPage from './features/admin/pages/AdminBooksPage';
import AllBorrowsPage from './features/admin/pages/AllBorrowsPage';
import UserBorrowHistoryPage from './features/admin/pages/UserBorrowHistoryPage';
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/books" element={<BooksPage />} />
            <Route path="/borrow" element={<BorrowHistoryPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          <Route element={<ProtectedRoute requireAdmin />}>
            <Route path="/admin/dashboard" element={<DashboardPage />} />
            <Route path="/admin/users" element={<UsersPage />} />
            <Route path="/admin/users/:id/history" element={<UserBorrowHistoryPage />} />
            <Route path="/admin/books" element={<AdminBooksPage />} />
            <Route path="/admin/borrows" element={<AllBorrowsPage />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;
