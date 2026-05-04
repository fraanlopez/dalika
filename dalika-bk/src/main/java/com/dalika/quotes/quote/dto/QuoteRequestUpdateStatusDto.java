package com.dalika.quotes.quote.dto;

import com.dalika.quotes.quote.entity.QuoteStatus;
import jakarta.validation.constraints.NotNull;

public record QuoteRequestUpdateStatusDto(
    @NotNull
    QuoteStatus status
) {}
