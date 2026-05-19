import { useEffect, useMemo, useState } from 'react';
import { adminApi } from '../api/adminApi';
import type { BorrowRecordResponse } from '../../borrow/types';
import { useToast } from '../../../hooks/useToast';

const PAGE_SIZE = 10;

type StatusFilter = 'ALL' | 'BORROWED' | 'RETURNED';

const FILTERS: { label: string; value: StatusFilter }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Borrowed', value: 'BORROWED' },
  { label: 'Returned', value: 'RETURNED' },
];

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    BORROWED: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    RETURNED: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  };
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold ${
        styles[status] ?? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
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
        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-3 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
    </td>
    <td className="px-4 py-3">
      <div className="space-y-2">
        <div className="h-4 w-44 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-3 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
    </td>
    <td className="px-4 py-3"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" /></td>
    <td className="px-4 py-3"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" /></td>
    <td className="px-4 py-3"><div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-full" /></td>
  </tr>
);

const AllBorrowsPage = () => {
  const [records, setRecords] = useState<BorrowRecordResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [page, setPage] = useState(1);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const data = await adminApi.getAllBorrows();
        setRecords(data);
      } catch (err: any) {
        showToast(err?.response?.data?.message || 'Failed to load borrow records', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const filtered = useMemo(() => {
    if (statusFilter === 'ALL') return records;
    return records.filter((r) => r.status === statusFilter);
  }, [records, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, records.length]);

  const total = filtered.length;
  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, total);
  const visible = filtered.slice(start, end);

  const emptyMessage =
    records.length === 0 ? 'No borrow records yet.' : `No ${statusFilter.toLowerCase()} records.`;

  return (
    <div className="pt-16 min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">All Borrows</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">Complete borrowing history</p>
        </div>

        <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div className="inline-flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1" role="tablist">
            {FILTERS.map((f) => {
              const active = statusFilter === f.value;
              return (
                <button
                  key={f.value}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setStatusFilter(f.value)}
                  className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                    active
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
          {!loading && records.length > 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-900 dark:text-slate-100">{filtered.length}</span> of {records.length}{' '}
              {records.length === 1 ? 'record' : 'records'}
            </p>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-left">Book</th>
                  <th className="px-4 py-3 text-left">Borrow Date</th>
                  <th className="px-4 py-3 text-left">Return Date</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                      {emptyMessage}
                    </td>
                  </tr>
                ) : (
                  visible.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900 dark:text-slate-100">{r.userFullName}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{r.userEmail}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900 dark:text-slate-100">{r.bookTitle}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">{r.bookIsbn}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{formatDate(r.borrowDate)}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{formatDate(r.returnDate)}</td>
                      <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && total > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700">
              <span className="text-sm text-slate-500 dark:text-slate-400">Showing {start + 1}–{end} of {total} results</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                  disabled={page === lastPage}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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

export default AllBorrowsPage;
