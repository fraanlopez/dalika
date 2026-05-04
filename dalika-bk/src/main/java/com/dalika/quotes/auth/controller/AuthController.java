package com.dalika.quotes.auth.controller;

import com.dalika.quotes.auth.dto.LoginRequest;
import com.dalika.quotes.auth.dto.RefreshRequest;
import com.dalika.quotes.auth.dto.TokenResponse;
import com.dalika.quotes.auth.service.AuthService;
import com.dalika.quotes.security.jwt.JwtTokenProvider;
import com.dalika.quotes.user.entity.User;
import com.dalika.quotes.user.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;

    public AuthController(AuthService authService, JwtTokenProvider jwtTokenProvider, UserRepository userRepository) {
        this.authService = authService;
        this.jwtTokenProvider = jwtTokenProvider;
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody LoginRequest request) {
        TokenResponse tokenResponse = authService.login(request);
        String userId = jwtTokenProvider.getUserIdFromToken(tokenResponse.accessToken());
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(Map.of(
            "success", true,
            "data", Map.of(
                "user", Map.of(
                    "id", user.getId(),
                    "name", user.getName(),
                    "email", user.getEmail(),
                    "role", user.getRole().name(),
                    "isActive", user.getEnabled(),
                    "createdAt", user.getCreatedAt().toString()
                ),
                "tokens", Map.of(
                    "accessToken", tokenResponse.accessToken(),
                    "refreshToken", tokenResponse.refreshToken(),
                    "tokenType", tokenResponse.tokenType()
                )
            )
        ));
    }

    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refreshToken(@Valid @RequestBody RefreshRequest request) {
        TokenResponse tokenResponse = authService.refreshToken(request);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "data", Map.of(
                "accessToken", tokenResponse.accessToken(),
                "refreshToken", tokenResponse.refreshToken(),
                "tokenType", tokenResponse.tokenType()
            )
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(Authentication authentication) {
        authService.logout(authentication.getName());
        return ResponseEntity.ok(Map.of("success", true, "message", "Logged out successfully"));
    }

    @PostMapping("/me")
    public ResponseEntity<Map<String, Object>> me(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(Map.of(
            "success", true,
            "data", Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole().name(),
                "isActive", user.getEnabled(),
                "createdAt", user.getCreatedAt().toString()
            )
        ));
    }
}
