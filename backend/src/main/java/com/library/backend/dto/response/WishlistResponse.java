package com.library.backend.dto.response;

import com.library.backend.entity.enums.BookStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WishlistResponse {

    private Long id;
    private Long bookId;
    private String bookTitle;
    private String bookAuthor;
    private BookStatus bookStatus;
    private LocalDateTime addedAt;
}
