package com.library.backend.controller;

import com.library.backend.dto.response.WishlistResponse;
import com.library.backend.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class WishlistController {

    private final WishlistService wishlistService;

    @PostMapping("/{bookId}")
    public ResponseEntity<WishlistResponse> add(@PathVariable Long bookId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return new ResponseEntity<>(wishlistService.addToWishlist(email, bookId), HttpStatus.CREATED);
    }

    @DeleteMapping("/{bookId}")
    public ResponseEntity<Void> remove(@PathVariable Long bookId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        wishlistService.removeFromWishlist(email, bookId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<WishlistResponse>> getMyWishlist() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(wishlistService.getMyWishlist(email));
    }

    @GetMapping("/{bookId}/check")
    public ResponseEntity<Map<String, Boolean>> check(@PathVariable Long bookId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        boolean inWishlist = wishlistService.isInWishlist(email, bookId);
        return ResponseEntity.ok(Map.of("inWishlist", inWishlist));
    }
}
