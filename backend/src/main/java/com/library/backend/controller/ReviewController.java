package com.library.backend.controller;

import com.library.backend.dto.request.ReviewRequest;
import com.library.backend.dto.response.ReviewResponse;
import com.library.backend.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/book/{bookId}")
    public ResponseEntity<ReviewResponse> add(
            @PathVariable Long bookId,
            @Valid @RequestBody ReviewRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return new ResponseEntity<>(reviewService.addReview(email, bookId, request), HttpStatus.CREATED);
    }

    @GetMapping("/book/{bookId}")
    public ResponseEntity<List<ReviewResponse>> getBookReviews(@PathVariable Long bookId) {
        return ResponseEntity.ok(reviewService.getBookReviews(bookId));
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> delete(@PathVariable Long reviewId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        reviewService.deleteReview(reviewId, email);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/averages")
    public ResponseEntity<Map<Long, Map<String, Object>>> getAllAverages() {
        return ResponseEntity.ok(reviewService.getAllAverages());
    }
}
