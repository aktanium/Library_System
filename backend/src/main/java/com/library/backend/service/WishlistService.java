package com.library.backend.service;

import com.library.backend.dto.response.WishlistResponse;
import com.library.backend.entity.Book;
import com.library.backend.entity.User;
import com.library.backend.entity.WishlistItem;
import com.library.backend.exception.BadRequestException;
import com.library.backend.exception.ResourceNotFoundException;
import com.library.backend.repository.BookRepository;
import com.library.backend.repository.UserRepository;
import com.library.backend.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;

    @Transactional
    public WishlistResponse addToWishlist(String email, Long bookId) {
        if (wishlistRepository.existsByUserEmailAndBookId(email, bookId)) {
            throw new BadRequestException("Book is already in your wishlist");
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + bookId));

        WishlistItem item = WishlistItem.builder()
                .user(user)
                .book(book)
                .build();
        return toResponse(wishlistRepository.save(item));
    }

    @Transactional
    public void removeFromWishlist(String email, Long bookId) {
        long removed = wishlistRepository.deleteByUserEmailAndBookId(email, bookId);
        if (removed == 0) {
            throw new ResourceNotFoundException("Book is not in your wishlist");
        }
    }

    @Transactional(readOnly = true)
    public List<WishlistResponse> getMyWishlist(String email) {
        return wishlistRepository.findByUserEmail(email).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public boolean isInWishlist(String email, Long bookId) {
        return wishlistRepository.existsByUserEmailAndBookId(email, bookId);
    }

    private WishlistResponse toResponse(WishlistItem item) {
        Book book = item.getBook();
        return WishlistResponse.builder()
                .id(item.getId())
                .bookId(book.getId())
                .bookTitle(book.getTitle())
                .bookAuthor(book.getAuthor())
                .bookStatus(book.getStatus())
                .addedAt(item.getAddedAt())
                .build();
    }
}
