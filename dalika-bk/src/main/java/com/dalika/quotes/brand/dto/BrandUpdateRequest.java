package com.dalika.quotes.brand.dto;

import jakarta.validation.constraints.Size;
import java.util.Set;

public record BrandUpdateRequest(
    @Size(max = 100)
    String name,

    @Size(max = 500)
    String description,

    String logoUrl,

    String externalLink,

    Boolean isActive,

    Set<String> categoryIds
) {}
