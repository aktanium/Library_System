package com.library.backend.service;

import com.library.backend.dto.request.ReviewRequest;
import com.library.backend.dto.response.ReviewResponse;
import com.library.backend.entity.Book;
import com.library.backend.entity.Review;
import com.library.backend.entity.User;
import com.library.backend.entity.enums.BorrowStatus;
import com.library.backend.entity.enums.Role;
import com.library.backend.exception.BadRequestException;
import com.library.backend.exception.ResourceNotFoundException;
import com.library.backend.repository.BookRepository;
import com.library.backend.repository.BorrowRecordRepository;
import com.library.backend.repository.ReviewRepository;
import com.library.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final BorrowRecordRepository borrowRecordRepository;

    @Transactional
    public ReviewResponse addReview(String email, Long bookId, ReviewRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + bookId));

        if (reviewRepository.existsByUserIdAndBookId(user.getId(), bookId)) {
            throw new BadRequestException("You have already reviewed this book");
        }

        boolean hasReturned = borrowRecordRepository.findByUserId(user.getId()).stream()
                .anyMatch(r -> r.getBook().getId().equals(bookId) && r.getStatus() == BorrowStatus.RETURNED);
        if (!hasReturned) {
            throw new BadRequestException("You can only review books you have borrowed and returned");
        }

        Review review = Review.builder()
                .user(user)
                .book(book)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();
        return toResponse(reviewRepository.save(review));
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getBookReviews(Long bookId) {
        if (!bookRepository.existsById(bookId)) {
            throw new ResourceNotFoundException("Book not found with id: " + bookId);
        }
        return reviewRepository.findByBookId(bookId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void deleteReview(Long reviewId, String email) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + reviewId));

        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        boolean isOwner = review.getUser().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;
        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("You can only delete your own reviews");
        }

        reviewRepository.delete(review);
    }

    @Transactional(readOnly = true)
    public Map<Long, Map<String, Object>> getAllAverages() {
        Map<Long, Map<String, Object>> result = new HashMap<>();
        for (Object[] row : reviewRepository.findAllAveragesRaw()) {
            Long bookId = (Long) row[0];
            Double avg = row[1] == null ? 0.0 : ((Number) row[1]).doubleValue();
            Long count = row[2] == null ? 0L : ((Number) row[2]).longValue();
            Map<String, Object> stats = new HashMap<>();
            stats.put("average", avg);
            stats.put("count", count);
            result.put(bookId, stats);
        }
        return result;
    }

    private ReviewResponse toResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .userName(review.getUser().getFullName())
                .userId(review.getUser().getId())
                .bookId(review.getBook().getId())
                .bookTitle(review.getBook().getTitle())
                .build();
    }
}
