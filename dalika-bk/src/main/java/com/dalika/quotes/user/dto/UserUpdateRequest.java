package com.dalika.quotes.user.dto;

import com.dalika.quotes.user.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record UserUpdateRequest(
    @Size(max = 100)
    String name,

    @Email
    @Size(max = 255)
    String email,

    @Size(min = 6, max = 100)
    String password,

    Role role,

    Boolean isActive
) {}
