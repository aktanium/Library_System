package com.library.backend.controller;

import com.library.backend.dto.response.BorrowRecordResponse;
import com.library.backend.service.BorrowService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/borrow")
@RequiredArgsConstructor
public class BorrowController {

    private final BorrowService borrowService;

    @PostMapping("/{bookId}")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<BorrowRecordResponse> borrow(@PathVariable Long bookId) {
        return new ResponseEntity<>(borrowService.borrow(bookId), HttpStatus.CREATED);
    }

    @PostMapping("/return/{recordId}")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<BorrowRecordResponse> returnBook(@PathVariable Long recordId) {
        return ResponseEntity.ok(borrowService.returnBook(recordId));
    }

    @GetMapping("/history")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<List<BorrowRecordResponse>> getHistory() {
        return ResponseEntity.ok(borrowService.getCurrentUserHistory());
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BorrowRecordResponse>> getAll() {
        return ResponseEntity.ok(borrowService.getAll());
    }
}
