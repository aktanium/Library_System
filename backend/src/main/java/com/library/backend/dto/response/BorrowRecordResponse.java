package com.library.backend.dto.response;

import com.library.backend.entity.enums.BorrowStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BorrowRecordResponse {

    private Long id;
    private String userFullName;
    private String userEmail;
    private Long bookId;
    private String bookTitle;
    private String bookIsbn;
    private LocalDateTime borrowDate;
    private LocalDateTime returnDate;
    private BorrowStatus status;
}
