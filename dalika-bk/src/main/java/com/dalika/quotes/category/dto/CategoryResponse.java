package com.dalika.quotes.category.dto;

import java.time.Instant;

public record CategoryResponse(
    String id,
    String name,
    String description,
    Long brandCount,
    Instant createdAt,
    Instant updatedAt
) {}
