import { useEffect, useState } from 'react';
import { bookApi } from '../../books/api/bookApi';
import { bookAdminApi } from '../api/bookAdminApi';
import type { BookRequest } from '../api/bookAdminApi';
import type { Book } from '../../../types/book';
import BookFormModal from '../components/BookFormModal';
import { useToast } from '../../../hooks/useToast';

const PAGE_SIZE = 10;

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    AVAILABLE: 'bg-green-100 text-green-700',
    BORROWED: 'bg-amber-100 text-amber-700',
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

const RowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="px-4 py-3"><div className="h-4 w-6 bg-slate-200 rounded" /></td>
    <td className="px-4 py-3"><div className="h-4 w-40 bg-slate-200 rounded" /></td>
    <td className="px-4 py-3"><div className="h-4 w-28 bg-slate-200 rounded" /></td>
    <td className="px-4 py-3"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
    <td className="px-4 py-3"><div className="h-4 w-28 bg-slate-200 rounded" /></td>
    <td className="px-4 py-3"><div className="h-4 w-8 bg-slate-200 rounded" /></td>
    <td className="px-4 py-3"><div className="h-6 w-20 bg-slate-200 rounded-full" /></td>
    <td className="px-4 py-3">
      <div className="flex gap-2 justify-end">
        <div className="h-8 w-8 bg-slate-200 rounded" />
        <div className="h-8 w-8 bg-slate-200 rounded" />
      </div>
    </td>
  </tr>
);

const EditIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
);

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

const AdminBooksPage = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState<boolean>(true);
  const [searching, setSearching] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingBook, setEditingBook] = useState<Book | undefined>(undefined);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
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
  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, total);
  const visible = books.slice(start, end);
  const isPending = loading || searching;

  const openCreate = () => {
    setEditingBook(undefined);
    setModalOpen(true);
  };

  const openEdit = (book: Book) => {
    setEditingBook(book);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingBook(undefined);
  };

  const refresh = async () => {
    if (searchTerm.trim()) await fetchByKeyword(searchTerm.trim());
    else await fetchAll();
  };

  const handleSubmit = async (data: BookRequest) => {
    if (editingBook) {
      await bookAdminApi.updateBook(editingBook.id, data);
      showToast('Book updated', 'success');
    } else {
      await bookAdminApi.createBook(data);
      showToast('Book added to library', 'success');
    }
    closeModal();
    await refresh();
  };

  const handleDelete = async (book: Book) => {
    if (!window.confirm('Delete this book?')) return;
    try {
      setActionLoading(book.id);
      await bookAdminApi.deleteBook(book.id);
      showToast('Book removed from library', 'success');
      await refresh();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to delete book', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#0f172a]">Book Catalog</h1>
            <p className="text-slate-600 mt-1 text-sm">Manage your library collection</p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="bg-[#2563eb] hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors"
          >
            + Add Book
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 mb-6 p-4">
          <div className="relative">
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
              className="w-full pl-10 pr-10 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none transition-shadow"
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
          {searching && !loading && (
            <p className="mt-2 text-xs text-slate-500">Searching…</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase text-xs tracking-wider">
                  <th className="px-4 py-3 text-left w-12">#</th>
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left">Author</th>
                  <th className="px-4 py-3 text-left">Genre</th>
                  <th className="px-4 py-3 text-left">ISBN</th>
                  <th className="px-4 py-3 text-left">Qty</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isPending ? (
                  Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)
                ) : visible.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-500">
                      {searchTerm ? 'No books match your search.' : 'No books in the catalog.'}
                    </td>
                  </tr>
                ) : (
                  visible.map((book, idx) => (
                    <tr key={book.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-slate-500">{start + idx + 1}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{book.title}</td>
                      <td className="px-4 py-3 text-slate-600">{book.author}</td>
                      <td className="px-4 py-3 text-slate-600">{book.genre}</td>
                      <td className="px-4 py-3 text-slate-500 font-mono text-xs">{book.isbn}</td>
                      <td className="px-4 py-3 text-slate-900 font-semibold">{book.quantity}</td>
                      <td className="px-4 py-3"><StatusBadge status={book.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEdit(book)}
                            disabled={actionLoading === book.id}
                            aria-label="Edit"
                            title="Edit"
                            className="p-2 rounded-md text-[#2563eb] hover:bg-blue-50 disabled:opacity-50 transition-colors"
                          >
                            <EditIcon />
                          </button>
                          <button
                            onClick={() => handleDelete(book)}
                            disabled={actionLoading === book.id}
                            aria-label="Delete"
                            title="Delete"
                            className="p-2 rounded-md text-[#dc2626] hover:bg-red-50 disabled:opacity-50 transition-colors"
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

          {!isPending && total > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
              <span className="text-sm text-slate-500">Showing {start + 1}–{end} of {total} results</span>
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

      <BookFormModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        initialData={editingBook}
      />
    </div>
  );
};

export default AdminBooksPage;
