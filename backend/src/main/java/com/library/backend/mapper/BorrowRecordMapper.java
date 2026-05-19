package com.library.backend.mapper;

import com.library.backend.dto.response.BorrowRecordResponse;
import com.library.backend.entity.BorrowRecord;
import org.springframework.stereotype.Component;

@Component
public class BorrowRecordMapper {

    public BorrowRecordResponse toResponse(BorrowRecord record) {
        return BorrowRecordResponse.builder()
                .id(record.getId())
                .userFullName(record.getUser().getFullName())
                .userEmail(record.getUser().getEmail())
                .bookId(record.getBook().getId())
                .bookTitle(record.getBook().getTitle())
                .bookIsbn(record.getBook().getIsbn())
                .borrowDate(record.getBorrowDate())
                .returnDate(record.getReturnDate())
                .status(record.getStatus())
                .build();
    }
}
