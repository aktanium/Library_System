import { useEffect, useState } from 'react';
import { wishlistApi } from '../api/wishlistApi';
import type { WishlistResponse } from '../api/wishlistApi';
import { borrowApi } from '../../borrow/api/borrowApi';
import { useToast } from '../../../hooks/useToast';

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    AVAILABLE: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    BORROWED: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
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

const TrashIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M3 7h18M10 7V4a1 1 0 011-1h2a1 1 0 011 1v3"
    />
  </svg>
);

const RowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="px-4 py-3"><div className="h-4 w-44 bg-slate-200 dark:bg-slate-700 rounded" /></td>
    <td className="px-4 py-3"><div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" /></td>
    <td className="px-4 py-3"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" /></td>
    <td className="px-4 py-3"><div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-full" /></td>
    <td className="px-4 py-3"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" /></td>
    <td className="px-4 py-3">
      <div className="flex gap-2 justify-end">
        <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
    </td>
  </tr>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16 text-slate-400">
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
        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
      />
    </svg>
    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
      Your wishlist is empty. Browse the catalog to add books!
    </p>
  </div>
);

const WishlistPage = () => {
  const [items, setItems] = useState<WishlistResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const { showToast } = useToast();

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const data = await wishlistApi.getMyWishlist();
      setItems(data);
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to load wishlist', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (item: WishlistResponse) => {
    try {
      setActionId(item.bookId);
      await wishlistApi.removeFromWishlist(item.bookId);
      showToast('Removed from wishlist', 'success');
      setItems((prev) => prev.filter((i) => i.bookId !== item.bookId));
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to remove', 'error');
    } finally {
      setActionId(null);
    }
  };

  const handleBorrow = async (item: WishlistResponse) => {
    try {
      setActionId(item.bookId);
      await borrowApi.borrowBook(item.bookId);
      showToast('Book borrowed successfully', 'success');
      // Optimistic: remove from wishlist UI after successful borrow
      // (Server-side it's still in wishlist; user can re-borrow later if returned)
      await fetchWishlist();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to borrow book', 'error');
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">My Wishlist</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
            Books you'd like to borrow later
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">
                  <th className="px-4 py-3 text-left">Book Title</th>
                  <th className="px-4 py-3 text-left">Author</th>
                  <th className="px-4 py-3 text-left">Genre</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Added On</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => <RowSkeleton key={i} />)
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-0">
                      <EmptyState />
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                        {item.bookTitle}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{item.bookAuthor}</td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">—</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={item.bookStatus} />
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                        {formatDate(item.addedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end items-center gap-2">
                          {item.bookStatus === 'AVAILABLE' && (
                            <button
                              type="button"
                              onClick={() => handleBorrow(item)}
                              disabled={actionId === item.bookId}
                              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#16a34a] hover:bg-green-700 disabled:opacity-50 transition-colors"
                            >
                              {actionId === item.bookId ? 'Borrowing…' : 'Borrow Now'}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemove(item)}
                            disabled={actionId === item.bookId}
                            aria-label="Remove from wishlist"
                            title="Remove"
                            className="p-2 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-50 transition-colors"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;
