import { useEffect, useMemo, useState } from 'react';
import { reviewApi } from '../api/reviewApi';
import type { ReviewResponse } from '../api/reviewApi';
import { useToast } from '../../../hooks/useToast';
import { AuthContext } from '../../../context/AuthContext';
import { useContext } from 'react';
import StarRating from './StarRating';

interface ReviewSectionProps {
  bookId: number;
  canWriteReview: boolean; // true when user has returned the book and not already reviewed it
}

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('') || '?';

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

const ReviewSection = ({ bookId, canWriteReview }: ReviewSectionProps) => {
  const auth = useContext(AuthContext);
  const { showToast } = useToast();

  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewApi.getBookReviews(bookId);
      setReviews(data);
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to load reviews', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId]);

  const { average, count } = useMemo(() => {
    if (reviews.length === 0) return { average: 0, count: 0 };
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return { average: sum / reviews.length, count: reviews.length };
  }, [reviews]);

  const userEmail = auth?.email ?? null;
  const isAdmin = auth?.isAdmin ?? false;
  const userHasReviewed = userEmail
    ? reviews.some((r) => r.userName && reviews.find((rr) => rr.id === r.id)?.userId !== undefined &&
        (auth?.displayName && r.userName.toLowerCase() === auth.displayName.toLowerCase()))
    : false;

  // canWriteReview is the parent's judgment (RETURNED record exists). We additionally hide if
  // the user has already posted a review for this book.
  const showWriteButton = canWriteReview && !userHasReviewed && !showForm;

  const resetForm = () => {
    setShowForm(false);
    setRating(0);
    setComment('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      showToast('Please pick a rating from 1 to 5 stars', 'error');
      return;
    }
    try {
      setSubmitting(true);
      await reviewApi.addReview(bookId, { rating, comment: comment.trim() });
      showToast('Review posted', 'success');
      resetForm();
      await fetchReviews();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to post review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (review: ReviewResponse) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      setDeletingId(review.id);
      await reviewApi.deleteReview(review.id);
      showToast('Review deleted', 'success');
      await fetchReviews();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to delete review', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const canDelete = (review: ReviewResponse) => {
    if (isAdmin) return true;
    if (!auth?.displayName) return false;
    return review.userName?.toLowerCase() === auth.displayName.toLowerCase();
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-700 px-4 sm:px-6 py-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <StarRating value={average} readOnly size="md" />
          <span className="text-sm text-slate-600 dark:text-slate-300">
            {count === 0
              ? 'No reviews yet'
              : `${average.toFixed(1)} · ${count} ${count === 1 ? 'review' : 'reviews'}`}
          </span>
        </div>
        {showWriteButton && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#2563eb] hover:bg-blue-700 shadow-sm transition-colors"
          >
            Write a Review
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 mb-4 space-y-3"
        >
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Your rating
            </label>
            <StarRating value={rating} onChange={setRating} size="lg" />
          </div>
          <div>
            <label
              htmlFor={`review-comment-${bookId}`}
              className="block text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1"
            >
              Comment (optional)
            </label>
            <textarea
              id={`review-comment-${bookId}`}
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 500))}
              rows={3}
              maxLength={500}
              placeholder="What did you think?"
              className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 text-sm placeholder-slate-400 focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none transition-shadow resize-y"
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 text-right">
              {comment.length}/500
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={resetForm}
              disabled={submitting}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold text-white bg-[#2563eb] hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Submitting…' : 'Submit Review'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">Loading reviews…</div>
      ) : reviews.length === 0 ? (
        <div className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Be the first to review this book.
        </div>
      ) : (
        <ul className="space-y-3">
          {reviews.map((r) => (
            <li
              key={r.id}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 flex gap-3"
            >
              <div
                className="w-9 h-9 rounded-full bg-[#2563eb] text-white text-xs font-semibold flex items-center justify-center shrink-0"
                aria-hidden="true"
              >
                {getInitials(r.userName)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {r.userName}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(r.createdAt)}
                    </span>
                  </div>
                  {canDelete(r) && (
                    <button
                      type="button"
                      onClick={() => handleDelete(r)}
                      disabled={deletingId === r.id}
                      aria-label="Delete review"
                      title="Delete review"
                      className="p-1.5 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-50 transition-colors"
                    >
                      <TrashIcon />
                    </button>
                  )}
                </div>
                <div className="mt-1">
                  <StarRating value={r.rating} readOnly size="sm" />
                </div>
                {r.comment && (
                  <p className="mt-2 text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap break-words">
                    {r.comment}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ReviewSection;
