package com.dalika.quotes.user.controller;

import com.dalika.quotes.common.pagination.PaginatedResponse;
import com.dalika.quotes.user.dto.UserCreateRequest;
import com.dalika.quotes.user.dto.UserResponse;
import com.dalika.quotes.user.dto.UserUpdateRequest;
import com.dalika.quotes.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllUsers(@PageableDefault(size = 20) Pageable pageable) {
        PaginatedResponse<UserResponse> users = userService.getAllUsers(pageable);
        return ResponseEntity.ok(Map.of("success", true, "data", users));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getUserById(@PathVariable String id) {
        UserResponse user = userService.getUserById(id);
        return ResponseEntity.ok(Map.of("success", true, "data", user));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createUser(@Valid @RequestBody UserCreateRequest request) {
        UserResponse user = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "data", user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateUser(@PathVariable String id, @Valid @RequestBody UserUpdateRequest request) {
        UserResponse user = userService.updateUser(id, request);
        return ResponseEntity.ok(Map.of("success", true, "data", user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "User deleted successfully"));
    }
}
