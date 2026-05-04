package com.dalika.quotes.brand.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.Set;

public record BrandCreateRequest(
    @NotBlank
    @Size(max = 100)
    String name,

    @Size(max = 500)
    String description,

    String logoUrl,

    String externalLink,

    Set<String> categoryIds
) {}
