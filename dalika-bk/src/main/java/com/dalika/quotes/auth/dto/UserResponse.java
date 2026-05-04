package com.dalika.quotes.auth.dto;

public record UserResponse(
    String id,
    String name,
    String email,
    String role,
    Boolean enabled,
    String createdAt
) {}
