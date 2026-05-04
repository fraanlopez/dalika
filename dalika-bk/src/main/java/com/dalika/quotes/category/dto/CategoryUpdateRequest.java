package com.dalika.quotes.category.dto;

import jakarta.validation.constraints.Size;

public record CategoryUpdateRequest(
    @Size(max = 100)
    String name,

    @Size(max = 500)
    String description
) {}
