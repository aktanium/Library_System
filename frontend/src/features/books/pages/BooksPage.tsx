import { useEffect, useMemo, useState } from 'react';
import { bookApi } from '../api/bookApi';
import { borrowApi } from '../../borrow/api/borrowApi';
import { wishlistApi } from '../../wishlist/api/wishlistApi';
import { reviewApi } from '../../reviews/api/reviewApi';
// borrowApi is also used for borrow history lookup
import type { BookRatingStats } from '../../reviews/api/reviewApi';
import BookDetailModal from '../components/BookDetailModal';
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

const RatingCell = ({ stats }: { stats?: BookRatingStats }) => {
  if (!stats || stats.count === 0) {
    return <span className="text-slate-300 dark:text-slate-500 text-xs">No reviews</span>;
  }
  const rounded = Math.round(stats.average);
  return (
    <span className="flex items-center gap-1">
      <span className="text-amber-400">
        {'★'.repeat(rounded)}
        {'☆'.repeat(Math.max(0, 5 - rounded))}
      </span>
      <span className="text-xs text-slate-500 dark:text-slate-400">
        {stats.average.toFixed(1)} ({stats.count})
      </span>
    </span>
  );
};

const RowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="px-4 py-3"><div className="h-4 w-6 bg-slate-200 dark:bg-slate-700 rounded" /></td>
    <td className="px-4 py-3"><div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded" /></td>
    <td className="px-4 py-3"><div className="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded" /></td>
    <td className="px-4 py-3"><div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" /></td>
    <td className="px-4 py-3"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" /></td>
    <td className="px-4 py-3"><div className="h-4 w-8 bg-slate-200 dark:bg-slate-700 rounded" /></td>
    <td className="px-4 py-3"><div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-full" /></td>
    <td className="px-4 py-3">
      <div className="flex gap-2 justify-end">
        <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
    </td>
  </tr>
);

const CardSkeleton = () => (
  <div className="animate-pulse bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-3">
    <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
    <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-700 rounded" />
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

  const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set());
  const [wishlistToggling, setWishlistToggling] = useState<number | null>(null);
  const [ratings, setRatings] = useState<Record<number, BookRatingStats>>({});
  const [returnedBookIds, setReturnedBookIds] = useState<Set<number>>(new Set());
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

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

  // Wishlist + ratings + borrow history — Promise.allSettled so a single failed endpoint
  // doesn't break the others. History is what unlocks "Write a review" in the detail modal.
  useEffect(() => {
    if (!isAuthenticated) {
      setWishlistIds(new Set());
      setReturnedBookIds(new Set());
      return;
    }
    let cancelled = false;

    const fetchAux = async () => {
      const [booksResult, wishlistResult, ratingsResult, historyResult] = await Promise.allSettled([
        bookApi.getAllBooks(),
        wishlistApi.getMyWishlist(),
        reviewApi.getAllAverages(),
        borrowApi.getMyBorrowHistory(),
      ]);
      if (cancelled) return;
      if (booksResult.status === 'fulfilled' && !searchTerm.trim()) {
        setBooks(booksResult.value);
      }
      if (wishlistResult.status === 'fulfilled') {
        setWishlistIds(new Set(wishlistResult.value.map((w) => w.bookId)));
      }
      if (ratingsResult.status === 'fulfilled') {
        setRatings(ratingsResult.value);
      }
      if (historyResult.status === 'fulfilled') {
        const returned = historyResult.value
          .filter((r) => r.status === 'RETURNED' && typeof r.bookId === 'number')
          .map((r) => r.bookId as number);
        setReturnedBookIds(new Set(returned));
      }
    };

    fetchAux();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Public ratings — even unauthenticated visitors should see stars on the catalog
  useEffect(() => {
    if (isAuthenticated) return;
    let cancelled = false;
    reviewApi
      .getAllAverages()
      .then((res) => {
        if (!cancelled) setRatings(res);
      })
      .catch(() => {
        /* leave empty */
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    setPage(1);
  }, [books.length]);

  const total = books.length;
  const availableCount = books.filter((b) => b.status === 'AVAILABLE').length;
  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, total);
  const visible = useMemo(() => books.slice(start, end), [books, start, end]);
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

  const toggleWishlist = async (book: Book) => {
    if (!isAuthenticated) {
      showToast('Sign in to use wishlist', 'error');
      return;
    }
    const isIn = wishlistIds.has(book.id);

    // Optimistic update first — UI flips immediately
    setWishlistIds((prev) => {
      const next = new Set(prev);
      if (isIn) next.delete(book.id);
      else next.add(book.id);
      return next;
    });

    try {
      setWishlistToggling(book.id);
      if (isIn) {
        await wishlistApi.removeFromWishlist(book.id);
        showToast('Removed from wishlist', 'success');
      } else {
        await wishlistApi.addToWishlist(book.id);
        showToast('Added to wishlist!', 'success');
      }
    } catch (err: any) {
      // Revert
      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (isIn) next.add(book.id);
        else next.delete(book.id);
        return next;
      });
      showToast(err?.response?.data?.message || 'Failed to update wishlist', 'error');
    } finally {
      setWishlistToggling(null);
    }
  };

  const borrowButtonClass = (disabled: boolean) =>
    `inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
      disabled
        ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
        : 'text-white bg-[#2563eb] hover:bg-blue-700 disabled:opacity-50'
    }`;

  const bookmarkButtonClass = (saved: boolean) =>
    `p-1.5 rounded transition-colors disabled:opacity-50 ${
      saved ? 'text-amber-400 hover:text-amber-500' : 'text-slate-300 hover:text-slate-400'
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
                  <th className="px-4 py-3 text-left w-12">#</th>
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left">Author</th>
                  <th className="px-4 py-3 text-left">Genre</th>
                  <th className="px-4 py-3 text-left">Rating</th>
                  <th className="px-4 py-3 text-left">Qty</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {isPending ? (
                  Array.from({ length: 8 }).map((_, i) => <RowSkeleton key={i} />)
                ) : visible.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-0">
                      <EmptyMessage
                        message={searchTerm ? 'No books match your search.' : 'No books found.'}
                      />
                    </td>
                  </tr>
                ) : (
                  visible.map((book, idx) => {
                    const disabled = book.status !== 'AVAILABLE';
                    const saved = wishlistIds.has(book.id);
                    return (
                      <tr
                        key={book.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
                      >
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                          {start + idx + 1}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => setSelectedBook(book)}
                            className="font-medium text-slate-900 dark:text-slate-100 hover:text-[#2563eb] dark:hover:text-blue-400 text-left underline-offset-2 hover:underline"
                          >
                            {book.title}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{book.author}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{book.genre}</td>
                        <td className="px-4 py-3"><RatingCell stats={ratings[book.id]} /></td>
                        <td className="px-4 py-3 text-slate-900 dark:text-slate-100 font-semibold">
                          {book.quantity}
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={book.status} /></td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isAuthenticated && (
                              <button
                                type="button"
                                onClick={() => toggleWishlist(book)}
                                disabled={wishlistToggling === book.id}
                                aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
                                title={saved ? 'Remove from wishlist' : 'Add to wishlist'}
                                className={bookmarkButtonClass(saved)}
                              >
                                <span aria-hidden="true" className="text-lg leading-none">
                                  {saved ? '🔖' : '🏷️'}
                                </span>
                              </button>
                            )}
                            {isAuthenticated && (
                              <button
                                onClick={() => handleBorrow(book)}
                                disabled={disabled || borrowingId === book.id}
                                className={borrowButtonClass(disabled)}
                              >
                                {borrowingId === book.id ? 'Borrowing…' : 'Borrow'}
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
                const saved = wishlistIds.has(book.id);
                return (
                  <div
                    key={book.id}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedBook(book)}
                        className="flex-1 min-w-0 text-left"
                      >
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 hover:text-[#2563eb] dark:hover:text-blue-400">
                          {book.title}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">{book.author}</p>
                      </button>
                      {isAuthenticated && (
                        <button
                          type="button"
                          onClick={() => toggleWishlist(book)}
                          disabled={wishlistToggling === book.id}
                          aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
                          className={bookmarkButtonClass(saved)}
                        >
                          <span aria-hidden="true" className="text-lg leading-none">
                            {saved ? '🔖' : '🏷️'}
                          </span>
                        </button>
                      )}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                        {book.genre}
                      </span>
                      <StatusBadge status={book.status} />
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Qty: <span className="font-semibold text-slate-700 dark:text-slate-200">{book.quantity}</span>
                      </span>
                    </div>
                    <div className="mt-2"><RatingCell stats={ratings[book.id]} /></div>
                    <p className="mt-2 text-xs font-mono text-slate-400 dark:text-slate-500">{book.isbn}</p>
                    {isAuthenticated && (
                      <button
                        onClick={() => handleBorrow(book)}
                        disabled={disabled || borrowingId === book.id}
                        className={`mt-3 w-full justify-center ${borrowButtonClass(disabled)}`}
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

      <BookDetailModal
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
        ratingStats={selectedBook ? ratings[selectedBook.id] : undefined}
        inWishlist={selectedBook ? wishlistIds.has(selectedBook.id) : false}
        onBorrow={async (b) => {
          await handleBorrow(b);
          setSelectedBook(null);
        }}
        onToggleWishlist={(b) => toggleWishlist(b)}
        borrowing={selectedBook ? borrowingId === selectedBook.id : false}
        wishlistToggling={selectedBook ? wishlistToggling === selectedBook.id : false}
        canWriteReview={selectedBook ? returnedBookIds.has(selectedBook.id) : false}
      />
    </div>
  );
};

export default BooksPage;
