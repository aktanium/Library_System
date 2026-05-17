package com.library.backend.service;

import com.library.backend.dto.response.BorrowRecordResponse;
import com.library.backend.entity.Book;
import com.library.backend.entity.BorrowRecord;
import com.library.backend.entity.User;
import com.library.backend.entity.enums.BookStatus;
import com.library.backend.entity.enums.BorrowStatus;
import com.library.backend.exception.BadRequestException;
import com.library.backend.exception.ResourceNotFoundException;
import com.library.backend.mapper.BorrowRecordMapper;
import com.library.backend.repository.BookRepository;
import com.library.backend.repository.BorrowRecordRepository;
import com.library.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BorrowService {

    private final BorrowRecordRepository borrowRecordRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final BorrowRecordMapper borrowRecordMapper;

    @Transactional
    public BorrowRecordResponse borrow(Long bookId) {
        User user = getCurrentUser();
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + bookId));

        if (book.getQuantity() <= 0) {
            throw new BadRequestException("Book is not available for borrowing");
        }

        book.setQuantity(book.getQuantity() - 1);
        if (book.getQuantity() == 0) {
            book.setStatus(BookStatus.BORROWED);
        }
        bookRepository.save(book);

        BorrowRecord record = BorrowRecord.builder()
                .user(user)
                .book(book)
                .borrowDate(LocalDateTime.now())
                .status(BorrowStatus.BORROWED)
                .build();

        return borrowRecordMapper.toResponse(borrowRecordRepository.save(record));
    }

    @Transactional
    public BorrowRecordResponse returnBook(Long recordId) {
        BorrowRecord record = borrowRecordRepository.findById(recordId)
                .orElseThrow(() -> new ResourceNotFoundException("Borrow record not found with id: " + recordId));

        if (record.getStatus() == BorrowStatus.RETURNED) {
            throw new BadRequestException("This book has already been returned");
        }

        User currentUser = getCurrentUser();
        boolean isAdmin = currentUser.getRole().name().equals("ADMIN");
        if (!isAdmin && !record.getUser().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You can only return your own borrowed books");
        }

        record.setReturnDate(LocalDateTime.now());
        record.setStatus(BorrowStatus.RETURNED);
        borrowRecordRepository.save(record);

        Book book = record.getBook();
        book.setQuantity(book.getQuantity() + 1);
        book.setStatus(BookStatus.AVAILABLE);
        bookRepository.save(book);

        return borrowRecordMapper.toResponse(record);
    }

    @Transactional(readOnly = true)
    public List<BorrowRecordResponse> getCurrentUserHistory() {
        String email = getCurrentUserEmail();
        return borrowRecordRepository.findByUserEmail(email).stream()
                .map(borrowRecordMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BorrowRecordResponse> getAll() {
        return borrowRecordRepository.findAll().stream()
                .map(borrowRecordMapper::toResponse)
                .toList();
    }

    private User getCurrentUser() {
        String email = getCurrentUserEmail();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private String getCurrentUserEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}
