package com.library.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {

    private Long id;
    private int rating;
    private String comment;
    private LocalDateTime createdAt;
    private String userName;
    private Long userId;
    private Long bookId;
    private String bookTitle;
}
