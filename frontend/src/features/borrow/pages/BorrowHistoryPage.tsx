// NOTE: Backend BorrowRecordResponse DTO does NOT include author — only bookTitle/bookIsbn.
// To add an Author column, update BorrowRecordMapper.toResponse(...) to map record.getBook().getAuthor().

import { useEffect, useMemo, useState } from 'react';
import { borrowApi } from '../api/borrowApi';
import type { BorrowRecordResponse } from '../types';
import { useToast } from '../../../hooks/useToast';

const PAGE_SIZE = 10;
const OVERDUE_DAYS = 14;

const isOverdue = (borrowDate: string, status: string): boolean =>
  status === 'BORROWED' &&
  Math.floor((Date.now() - new Date(borrowDate).getTime()) / 86400000) > OVERDUE_DAYS;

const StatusBadge = ({ status, overdue }: { status: string; overdue?: boolean }) => {
  if (overdue) {
    return (
      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
        OVERDUE
      </span>
    );
  }
  const styles: Record<string, string> = {
    BORROWED: 'bg-amber-100 text-amber-700',
    RETURNED: 'bg-green-100 text-green-700',
  };
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold ${
        styles[status] ?? 'bg-slate-100 text-slate-600'
      }`}
    >
      {status}
    </span>
  );
};

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const RowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="px-4 py-3">
      <div className="space-y-2">
        <div className="h-4 w-44 bg-slate-200 rounded" />
        <div className="h-3 w-28 bg-slate-200 rounded" />
      </div>
    </td>
    <td className="px-4 py-3"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
    <td className="px-4 py-3"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
    <td className="px-4 py-3"><div className="h-6 w-20 bg-slate-200 rounded-full" /></td>
    <td className="px-4 py-3"><div className="h-8 w-24 bg-slate-200 rounded ml-auto" /></td>
  </tr>
);

const EmptyState = () => (
  <tr>
    <td colSpan={5} className="px-4 py-16">
      <div className="flex flex-col items-center justify-center text-slate-400">
        <svg
          className="w-16 h-16 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
        <p className="text-sm font-medium text-slate-500">You haven&apos;t borrowed any books yet.</p>
      </div>
    </td>
  </tr>
);

const BorrowHistoryPage = () => {
  const [history, setHistory] = useState<BorrowRecordResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const { showToast } = useToast();

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await borrowApi.getMyBorrowHistory();
      setHistory(data);
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Failed to load borrow history', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleReturn = async (recordId: number) => {
    try {
      setActionLoading(recordId);
      await borrowApi.returnBook(recordId);
      showToast('Book returned successfully', 'success');
      await fetchHistory();
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Failed to return book', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const overdueCount = useMemo(
    () => history.filter((r) => isOverdue(r.borrowDate, r.status)).length,
    [history]
  );

  useEffect(() => {
    setPage(1);
  }, [history.length]);

  const total = history.length;
  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, total);
  const visible = history.slice(start, end);

  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#0f172a]">My Borrow History</h1>
          <p className="text-slate-600 mt-1 text-sm">Books you have borrowed</p>
        </div>

        {overdueCount > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6 flex items-start gap-3 text-red-700">
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p className="text-sm font-medium">
              You have {overdueCount} overdue book{overdueCount === 1 ? '' : 's'}. Please return them as soon as possible.
            </p>
          </div>
        )}

        <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase text-xs tracking-wider">
                  <th className="px-4 py-3 text-left">Book Title</th>
                  <th className="px-4 py-3 text-left">Borrowed On</th>
                  <th className="px-4 py-3 text-left">Return Date</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)
                ) : visible.length === 0 ? (
                  <EmptyState />
                ) : (
                  visible.map((r) => {
                    const overdue = isOverdue(r.borrowDate, r.status);
                    return (
                      <tr
                        key={r.id}
                        className={`hover:bg-slate-50 transition-colors ${
                          overdue ? 'border-l-4 border-red-500' : ''
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium text-[#0f172a]">{r.bookTitle}</div>
                          <div className="text-xs text-slate-500 font-mono">{r.bookIsbn}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-700">{formatDate(r.borrowDate)}</td>
                        <td className="px-4 py-3 text-slate-700">{formatDate(r.returnDate)}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={r.status} overdue={overdue} />
                          {overdue && (
                            <span className="ml-2 inline-block px-2 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">
                              BORROWED
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end">
                            {r.status === 'BORROWED' && (
                              <button
                                onClick={() => handleReturn(r.id)}
                                disabled={actionLoading === r.id}
                                className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold text-[#dc2626] border border-red-200 hover:bg-red-50 disabled:opacity-50 transition-colors"
                              >
                                {actionLoading === r.id ? 'Returning…' : 'Return Book'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {!loading && total > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
              <span className="text-sm text-slate-500">
                Showing {start + 1}–{end} of {total} results
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                  disabled={page === lastPage}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BorrowHistoryPage;
