package com.dalika.quotes.quote.dto;

import java.math.BigDecimal;

public record QuoteResponseCreateDto(
    String quoteUrl,
    String invoiceUrl,
    String trackingUrl,
    BigDecimal totalAmount,
    String adminNotes
) {}
