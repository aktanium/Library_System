package com.library.backend.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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

    @Size(max = 4000)
    private String description;

    @Size(max = 4000)
    private String summary;

    private Integer publishedYear;

    @Size(max = 20)
    private String coverColor;
}
