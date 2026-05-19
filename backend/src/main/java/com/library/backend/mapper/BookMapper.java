package com.library.backend.mapper;

import com.library.backend.dto.request.BookRequest;
import com.library.backend.dto.response.BookResponse;
import com.library.backend.entity.Book;
import com.library.backend.entity.enums.BookStatus;
import org.springframework.stereotype.Component;

@Component
public class BookMapper {

    public BookResponse toResponse(Book book) {
        return BookResponse.builder()
                .id(book.getId())
                .title(book.getTitle())
                .author(book.getAuthor())
                .genre(book.getGenre())
                .isbn(book.getIsbn())
                .quantity(book.getQuantity())
                .status(book.getStatus())
                .description(book.getDescription())
                .summary(book.getSummary())
                .publishedYear(book.getPublishedYear())
                .coverColor(book.getCoverColor())
                .build();
    }

    public Book toEntity(BookRequest request) {
        return Book.builder()
                .title(request.getTitle())
                .author(request.getAuthor())
                .genre(request.getGenre())
                .isbn(request.getIsbn())
                .quantity(request.getQuantity())
                .status(request.getQuantity() > 0 ? BookStatus.AVAILABLE : BookStatus.BORROWED)
                .description(request.getDescription())
                .summary(request.getSummary())
                .publishedYear(request.getPublishedYear())
                .coverColor(request.getCoverColor())
                .build();
    }

    public void updateEntity(Book book, BookRequest request) {
        book.setTitle(request.getTitle());
        book.setAuthor(request.getAuthor());
        book.setGenre(request.getGenre());
        book.setIsbn(request.getIsbn());
        book.setQuantity(request.getQuantity());
        book.setStatus(request.getQuantity() > 0 ? BookStatus.AVAILABLE : BookStatus.BORROWED);
        book.setDescription(request.getDescription());
        book.setSummary(request.getSummary());
        book.setPublishedYear(request.getPublishedYear());
        book.setCoverColor(request.getCoverColor());
    }
}
