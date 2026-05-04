package com.dalika.quotes.user.dto;

public record UserResponse(
    String id,
    String name,
    String email,
    String role,
    Boolean isActive,
    String createdAt,
    String updatedAt
) {}
