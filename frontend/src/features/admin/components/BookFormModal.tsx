import { useEffect, useState } from 'react';
import type { Book } from '../../../types/book';
import type { BookRequest } from '../api/bookAdminApi';

interface BookFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BookRequest) => Promise<void> | void;
  initialData?: Book;
}

const Spinner = () => (
  <svg className="animate-spin h-4 w-4 mr-2 text-white" fill="none" viewBox="0 0 24 24" aria-hidden="true">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
);

const inputClasses =
  'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none transition-shadow';
const labelClasses = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5';
const DEFAULT_COVER = '#4f46e5';

const BookFormModal = ({ isOpen, onClose, onSubmit, initialData }: BookFormModalProps) => {
  const isEdit = !!initialData;

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [isbn, setIsbn] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [description, setDescription] = useState('');
  const [summary, setSummary] = useState('');
  const [publishedYear, setPublishedYear] = useState<string>('');
  const [coverColor, setCoverColor] = useState<string>(DEFAULT_COVER);

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setAuthor(initialData.author);
      setGenre(initialData.genre ?? '');
      setIsbn(initialData.isbn);
      setQuantity(initialData.quantity);
      setDescription(initialData.description ?? '');
      setSummary(initialData.summary ?? '');
      setPublishedYear(initialData.publishedYear != null ? String(initialData.publishedYear) : '');
      setCoverColor(initialData.coverColor ?? DEFAULT_COVER);
    } else {
      setTitle('');
      setAuthor('');
      setGenre('');
      setIsbn('');
      setQuantity(1);
      setDescription('');
      setSummary('');
      setPublishedYear('');
      setCoverColor(DEFAULT_COVER);
    }
    setError('');
    setSubmitting(false);
  }, [initialData, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, submitting, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !author.trim() || !genre.trim()) {
      setError('Title, author, and genre are required.');
      return;
    }
    if (!Number.isInteger(quantity) || quantity < 0) {
      setError('Quantity must be a non-negative integer.');
      return;
    }

    let yearValue: number | null = null;
    if (publishedYear.trim() !== '') {
      const parsed = parseInt(publishedYear, 10);
      if (Number.isNaN(parsed) || parsed < 0 || parsed > 9999) {
        setError('Published year must be a valid integer.');
        return;
      }
      yearValue = parsed;
    }

    try {
      setSubmitting(true);
      setError('');
      await onSubmit({
        title: title.trim(),
        author: author.trim(),
        genre: genre.trim(),
        isbn: isbn.trim(),
        quantity,
        description: description.trim() || undefined,
        summary: summary.trim() || undefined,
        publishedYear: yearValue,
        coverColor: coverColor || undefined,
      });
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save book.');
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="book-modal-title"
    >
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={() => !submitting && onClose()}
          aria-hidden="true"
        />

        <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <h2 id="book-modal-title" className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {isEdit ? 'Edit Book' : 'Add Book'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              aria-label="Close"
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-50 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form className="px-6 py-6 space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="title" className={labelClasses}>
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={inputClasses}
                />
              </div>

              <div>
                <label htmlFor="author" className={labelClasses}>
                  Author <span className="text-red-500">*</span>
                </label>
                <input
                  id="author"
                  type="text"
                  required
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className={inputClasses}
                />
              </div>

              <div>
                <label htmlFor="genre" className={labelClasses}>
                  Genre <span className="text-red-500">*</span>
                </label>
                <input
                  id="genre"
                  type="text"
                  required
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className={inputClasses}
                />
              </div>

              <div>
                <label htmlFor="isbn" className={labelClasses}>ISBN</label>
                <input
                  id="isbn"
                  type="text"
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value)}
                  className={inputClasses}
                />
              </div>

              <div>
                <label htmlFor="quantity" className={labelClasses}>Quantity</label>
                <input
                  id="quantity"
                  type="number"
                  min={0}
                  value={quantity}
                  onChange={(e) => {
                    const parsed = parseInt(e.target.value, 10);
                    setQuantity(Number.isNaN(parsed) ? 0 : parsed);
                  }}
                  className={inputClasses}
                />
              </div>

              <div>
                <label htmlFor="publishedYear" className={labelClasses}>Published Year</label>
                <input
                  id="publishedYear"
                  type="number"
                  min={0}
                  max={9999}
                  placeholder="e.g. 2008"
                  value={publishedYear}
                  onChange={(e) => setPublishedYear(e.target.value)}
                  className={inputClasses}
                />
              </div>
            </div>

            <div>
              <label htmlFor="coverColor" className={labelClasses}>Cover Color</label>
              <div className="flex items-center gap-3">
                <input
                  id="coverColor"
                  type="color"
                  value={coverColor}
                  onChange={(e) => setCoverColor(e.target.value)}
                  className="h-10 w-16 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer"
                />
                <input
                  type="text"
                  value={coverColor}
                  onChange={(e) => setCoverColor(e.target.value)}
                  placeholder="#4f46e5"
                  className={`${inputClasses} font-mono`}
                />
                <div
                  style={{ backgroundColor: coverColor || DEFAULT_COVER }}
                  className="w-14 h-10 rounded shrink-0 border border-slate-200 dark:border-slate-700"
                  aria-hidden="true"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className={labelClasses}>Description</label>
              <textarea
                id="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short pitch shown in the book detail modal."
                className={`${inputClasses} resize-y`}
              />
            </div>

            <div>
              <label htmlFor="summary" className={labelClasses}>Summary</label>
              <textarea
                id="summary"
                rows={4}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Longer summary or back-cover blurb."
                className={`${inputClasses} resize-y`}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-[#2563eb] hover:bg-blue-700 rounded-lg shadow-sm disabled:opacity-50 transition-colors"
              >
                {submitting && <Spinner />}
                {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Book'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookFormModal;
