import { useEffect } from 'react';
import type { Book } from '../../../types/book';
import type { BookRatingStats } from '../../reviews/api/reviewApi';
import { useAuth } from '../../../hooks/useAuth';
import ReviewSection from '../../reviews/components/ReviewSection';

interface BookDetailModalProps {
  book: Book | null;
  onClose: () => void;
  ratingStats?: BookRatingStats;
  inWishlist: boolean;
  onBorrow: (book: Book) => void;
  onToggleWishlist: (book: Book) => void;
  borrowing?: boolean;
  wishlistToggling?: boolean;
  canWriteReview?: boolean;
}

const renderStars = (avg?: number) => {
  if (typeof avg !== 'number' || avg <= 0) return null;
  const rounded = Math.round(avg);
  return `${'★'.repeat(rounded)}${'☆'.repeat(Math.max(0, 5 - rounded))}`;
};

const BookDetailModal = ({
  book,
  onClose,
  ratingStats,
  inWishlist,
  onBorrow,
  onToggleWishlist,
  borrowing,
  wishlistToggling,
  canWriteReview = false,
}: BookDetailModalProps) => {
  const { isAuthenticated } = useAuth();

  // ESC to close
  useEffect(() => {
    if (!book) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [book, onClose]);

  if (!book) return null;

  const cover = book.coverColor || '#4f46e5';
  const stars = renderStars(ratingStats?.average);
  const disabled = book.status !== 'AVAILABLE';

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="book-detail-title"
    >
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div
          className="fixed inset-0 bg-black/60 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />

        <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700">
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3 right-3 z-10 p-2 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-[8rem_1fr] gap-6">
            {/* Cover */}
            <div
              style={{ backgroundColor: cover }}
              className="w-32 h-48 rounded-lg flex flex-col items-center justify-center p-3 text-white shadow-md mx-auto sm:mx-0"
            >
              <span className="text-xs font-bold text-center leading-tight line-clamp-5">
                {book.title}
              </span>
              <span className="text-[10px] mt-2 opacity-80 text-center line-clamp-2">{book.author}</span>
            </div>

            {/* Details */}
            <div className="min-w-0">
              <h2
                id="book-detail-title"
                className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 pr-8"
              >
                {book.title}
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{book.author}</p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {book.genre && (
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                    {book.genre}
                  </span>
                )}
                {book.publishedYear && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {book.publishedYear}
                  </span>
                )}
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    book.status === 'AVAILABLE'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                  }`}
                >
                  {book.status}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Qty: <span className="font-semibold text-slate-700 dark:text-slate-200">{book.quantity}</span>
                </span>
              </div>

              <div className="mt-3 flex items-center gap-1.5 min-h-[1.5rem]">
                {stars ? (
                  <>
                    <span className="text-amber-400" aria-label={`Rating ${ratingStats?.average.toFixed(1)}`}>
                      {stars}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {ratingStats!.average.toFixed(1)} ({ratingStats!.count}{' '}
                      {ratingStats!.count === 1 ? 'review' : 'reviews'})
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-slate-400 dark:text-slate-500">No reviews yet</span>
                )}
              </div>

              {book.description && (
                <section className="mt-5">
                  <h3 className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Description
                  </h3>
                  <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                    {book.description}
                  </p>
                </section>
              )}

              {book.summary && (
                <section className="mt-4">
                  <h3 className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Summary
                  </h3>
                  <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                    {book.summary}
                  </p>
                </section>
              )}

              {!book.description && !book.summary && (
                <p className="mt-5 text-sm italic text-slate-400 dark:text-slate-500">
                  No description available for this book yet.
                </p>
              )}
            </div>
          </div>

          <ReviewSection bookId={book.id} canWriteReview={canWriteReview} />

          {/* Footer */}
          {isAuthenticated && (
            <div className="flex flex-wrap justify-end gap-2 px-6 sm:px-8 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40">
              <button
                type="button"
                onClick={() => onToggleWishlist(book)}
                disabled={wishlistToggling}
                className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
                  inWishlist
                    ? 'text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50'
                    : 'text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {inWishlist ? '🔖 Remove from Wishlist' : '🏷️ Add to Wishlist'}
              </button>
              <button
                type="button"
                onClick={() => onBorrow(book)}
                disabled={disabled || borrowing}
                className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  disabled
                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                    : 'text-white bg-[#2563eb] hover:bg-blue-700 disabled:opacity-50'
                }`}
              >
                {borrowing ? 'Borrowing…' : disabled ? 'Unavailable' : 'Borrow'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetailModal;
