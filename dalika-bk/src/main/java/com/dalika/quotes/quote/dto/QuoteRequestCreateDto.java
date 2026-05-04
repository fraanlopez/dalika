package com.dalika.quotes.quote.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;

public record QuoteRequestCreateDto(
    @NotBlank
    @Size(max = 200)
    String title,

    @Size(max = 1000)
    String description,

    @NotEmpty
    @Valid
    List<QuoteItemDto> items
) {
    public record QuoteItemDto(
        @NotBlank
        String productUrl,

        String productName,

        Integer quantity
    ) {}
}
