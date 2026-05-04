package com.dalika.quotes.quote.dto;

import java.time.Instant;
import java.util.List;

public record QuoteRequestResponse(
    String id,
    String clientId,
    String clientName,
    String title,
    String description,
    String status,
    List<QuoteItemResponse> items,
    QuoteResponseDto response,
    Instant createdAt,
    Instant updatedAt,
    Instant respondedAt,
    Instant expiresAt
) {
    public record QuoteItemResponse(
        String id,
        String productUrl,
        String productName,
        Integer quantity
    ) {}

    public record QuoteResponseDto(
        String id,
        String quoteUrl,
        String invoiceUrl,
        String trackingUrl,
        String adminNotes,
        Instant createdAt
    ) {}
}
