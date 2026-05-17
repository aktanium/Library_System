package com.library.backend.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BookRequest {

    @NotBlank
    private String title;

    @NotBlank
    private String author;

    private String genre;

    @NotBlank
    private String isbn;

    @NotNull
    @Min(0)
    private Integer quantity;
}
