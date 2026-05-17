import { useState } from 'react';
import type { Book } from '../../../types/book';
import { borrowApi } from '../../borrow/api/borrowApi';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';

interface BookCardProps {
  book: Book;
  onActionComplete?: () => void;
}

const BookCard = ({ book, onActionComplete }: BookCardProps) => {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [borrowing, setBorrowing] = useState(false);

  const handleBorrow = async () => {
    try {
      setBorrowing(true);
      await borrowApi.borrowBook(book.id);
      showToast('Book borrowed successfully', 'success');
      if (onActionComplete) {
        onActionComplete();
      }
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Failed to borrow book', 'error');
    } finally {
      setBorrowing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-indigo-100 transition-all duration-200 flex flex-col h-full group">
      <div className="flex-1">
        <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors" title={book.title}>
          {book.title}
        </h3>
        <p className="text-sm font-medium text-gray-500 mt-1">{book.author}</p>
        
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-700">
            {book.genre}
          </span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold ${
            book.status === 'AVAILABLE' 
              ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20' 
              : 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20'
          }`}>
            {book.status}
          </span>
        </div>
      </div>
      
      <div className="mt-5 pt-4 border-t border-gray-50 flex justify-between items-center text-sm">
        <div className="flex items-center space-x-2">
          <span className="text-gray-500 font-medium">Qty</span>
          <span className="text-gray-900 font-semibold bg-gray-50 px-2 py-1 rounded-md">{book.quantity}</span>
        </div>
        
        {isAuthenticated && book.quantity > 0 && (
          <button
            onClick={handleBorrow}
            disabled={borrowing}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-semibold rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {borrowing ? 'Borrowing...' : 'Borrow'}
          </button>
        )}
      </div>
    </div>
  );
};

export default BookCard;
