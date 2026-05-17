import { useEffect, useState } from 'react';
import { bookApi } from '../api/bookApi';
import { borrowApi } from '../../borrow/api/borrowApi';
import type { Book } from '../../../types/book';
import { useToast } from '../../../hooks/useToast';
import { useAuth } from '../../../hooks/useAuth';

const PAGE_SIZE = 10;

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

const RowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="px-4 py-3"><div className="h-4 w-6 bg-slate-200 dark:bg-slate-700 rounded" /></td>
    <td className="px-4 py-3"><div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded" /></td>
    <td className="px-4 py-3"><div className="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded" /></td>
    <td className="px-4 py-3"><div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" /></td>
    <td className="px-4 py-3"><div className="h-4 w-8 bg-slate-200 dark:bg-slate-700 rounded" /></td>
    <td className="px-4 py-3"><div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-full" /></td>
    <td className="px-4 py-3"><div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded ml-auto" /></td>
  </tr>
);

const CardSkeleton = () => (
  <div className="animate-pulse bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-3">
    <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
    <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-700 rounded" />
    <div className="flex gap-2">
      <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-full" />
      <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
    </div>
    <div className="h-8 w-full bg-slate-200 dark:bg-slate-700 rounded" />
  </div>
);

const EmptyMessage = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-16 text-slate-400">
    <svg
      className="w-12 h-12 mb-3"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
      />
    </svg>
    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{message}</p>
  </div>
);

const BooksPage = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [page, setPage] = useState(1);
  const [borrowingId, setBorrowingId] = useState<number | null>(null);
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const fetchAll = async () => {
    try {
      const data = await bookApi.getAllBooks();
      setBooks(data);
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to load books', 'error');
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  const fetchByKeyword = async (keyword: string) => {
    try {
      const data = await bookApi.searchBooks(keyword);
      setBooks(data);
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to search books', 'error');
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  useEffect(() => {
    setSearching(true);
    const timer = setTimeout(() => {
      if (searchTerm.trim()) fetchByKeyword(searchTerm.trim());
      else fetchAll();
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [books.length]);

  const total = books.length;
  const availableCount = books.filter((b) => b.status === 'AVAILABLE').length;
  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, total);
  const visible = books.slice(start, end);
  const isPending = loading || searching;

  const handleBorrow = async (book: Book) => {
    try {
      setBorrowingId(book.id);
      await borrowApi.borrowBook(book.id);
      showToast('Book borrowed successfully', 'success');
      if (searchTerm.trim()) await fetchByKeyword(searchTerm.trim());
      else await fetchAll();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to borrow book', 'error');
    } finally {
      setBorrowingId(null);
    }
  };

  const borrowButtonClass = (disabled: boolean) =>
    `inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
      disabled
        ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
        : 'text-white bg-[#2563eb] hover:bg-blue-700 disabled:opacity-50'
    }`;

  return (
    <div className="pt-16 min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Library Catalog</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
              {isPending ? 'Loading…' : `${availableCount} books available`}
            </p>
          </div>
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
                />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search title, author, genre, ISBN…"
              className="w-full pl-10 pr-10 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 shadow-sm focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none transition-shadow"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Desktop: table */}
        <div className="hidden md:block bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">
                  <th scope="col" className="px-4 py-3 text-left w-12">#</th>
                  <th scope="col" className="px-4 py-3 text-left">Title</th>
                  <th scope="col" className="px-4 py-3 text-left">Author</th>
                  <th scope="col" className="px-4 py-3 text-left">Genre</th>
                  <th scope="col" className="px-4 py-3 text-left">Qty</th>
                  <th scope="col" className="px-4 py-3 text-left">Status</th>
                  <th scope="col" className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {isPending ? (
                  Array.from({ length: 8 }).map((_, i) => <RowSkeleton key={i} />)
                ) : visible.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-0">
                      <EmptyMessage
                        message={searchTerm ? 'No books match your search.' : 'No books found.'}
                      />
                    </td>
                  </tr>
                ) : (
                  visible.map((book, idx) => {
                    const disabled = book.status !== 'AVAILABLE';
                    return (
                      <tr
                        key={book.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
                      >
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                          {start + idx + 1}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                          {book.title}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{book.author}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{book.genre}</td>
                        <td className="px-4 py-3 text-slate-900 dark:text-slate-100 font-semibold">
                          {book.quantity}
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={book.status} /></td>
                        <td className="px-4 py-3 text-right">
                          {isAuthenticated ? (
                            <button
                              onClick={() => handleBorrow(book)}
                              disabled={disabled || borrowingId === book.id}
                              className={borrowButtonClass(disabled)}
                            >
                              {borrowingId === book.id ? 'Borrowing…' : 'Borrow'}
                            </button>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {!isPending && total > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Showing {start + 1}–{end} of {total} results
              </span>
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

        {/* Mobile: cards */}
        <div className="md:hidden space-y-3">
          {isPending ? (
            Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)
          ) : visible.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
              <EmptyMessage
                message={searchTerm ? 'No books match your search.' : 'No books found.'}
              />
            </div>
          ) : (
            <>
              {visible.map((book) => {
                const disabled = book.status !== 'AVAILABLE';
                return (
                  <div
                    key={book.id}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-sm"
                  >
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">{book.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">{book.author}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                        {book.genre}
                      </span>
                      <StatusBadge status={book.status} />
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Qty: <span className="font-semibold text-slate-700 dark:text-slate-200">{book.quantity}</span>
                      </span>
                    </div>
                    <p className="mt-2 text-xs font-mono text-slate-400 dark:text-slate-500">{book.isbn}</p>
                    {isAuthenticated && (
                      <button
                        onClick={() => handleBorrow(book)}
                        disabled={disabled || borrowingId === book.id}
                        className={`mt-3 w-full ${borrowButtonClass(disabled)} justify-center`}
                      >
                        {borrowingId === book.id ? 'Borrowing…' : 'Borrow'}
                      </button>
                    )}
                  </div>
                );
              })}

              {total > 0 && (
                <div className="flex items-center justify-between bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {start + 1}–{end} of {total}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                      disabled={page === lastPage}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BooksPage;
