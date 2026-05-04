package com.dalika.quotes.brand.dto;

import java.time.Instant;
import java.util.Set;

public record BrandResponse(
    String id,
    String name,
    String description,
    String logoUrl,
    String externalLink,
    Boolean isActive,
    Set<CategorySummary> categories,
    Instant createdAt,
    Instant updatedAt
) {
    public record CategorySummary(
        String id,
        String name
    ) {}
}
