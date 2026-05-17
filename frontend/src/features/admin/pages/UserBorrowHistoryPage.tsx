import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { adminApi } from '../api/adminApi';
import type { User } from '../types';
import type { BorrowRecordResponse } from '../../borrow/types';

const UserBorrowHistoryPage = () => {
  const { id } = useParams<{ id: string }>();
  const userId = id ? parseInt(id, 10) : NaN;

  const [user, setUser] = useState<User | null>(null);
  const [records, setRecords] = useState<BorrowRecordResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (Number.isNaN(userId)) {
      setError('Invalid user id.');
      setLoading(false);
      return;
    }
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [u, h] = await Promise.all([
          adminApi.getUserById(userId),
          adminApi.getUserBorrowHistory(userId),
        ]);
        setUser(u);
        setRecords(h);
        setError('');
      } catch (err: any) {
        console.error('Failed to load user history', err);
        setError(err.response?.data?.message || 'Failed to load user history.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 w-full">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-100 border-t-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="mb-6">
        <Link
          to="/admin/users"
          className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Users
        </Link>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {user && (
        <div className="mb-8 bg-white shadow-sm rounded-xl border border-gray-200 p-6">
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">{user.fullName}</h1>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
            <span>
              <span className="font-medium text-gray-700">Email:</span> {user.email}
            </span>
            <span className="flex items-center gap-2">
              <span className="font-medium text-gray-700">Role:</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
              }`}>
                {user.role}
              </span>
            </span>
          </div>
        </div>
      )}

      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900">Borrow History</h2>
        <p className="text-sm text-gray-500">
          {records.length} record{records.length === 1 ? '' : 's'}
        </p>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book Title</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ISBN</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Borrow Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{r.bookTitle}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.bookIsbn}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.userFullName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.userEmail}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(r.borrowDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {r.returnDate ? new Date(r.returnDate).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      r.status === 'BORROWED'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500 text-sm">
                    No borrow history for this user.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserBorrowHistoryPage;
