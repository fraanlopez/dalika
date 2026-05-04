package com.dalika.quotes.category.controller;

import com.dalika.quotes.category.dto.CategoryCreateRequest;
import com.dalika.quotes.category.dto.CategoryResponse;
import com.dalika.quotes.category.dto.CategoryUpdateRequest;
import com.dalika.quotes.category.service.CategoryService;
import com.dalika.quotes.common.pagination.PaginatedResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllCategories(@PageableDefault(size = 20) Pageable pageable) {
        PaginatedResponse<CategoryResponse> categories = categoryService.getAllCategories(pageable);
        return ResponseEntity.ok(Map.of("success", true, "data", categories));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getCategoryById(@PathVariable String id) {
        CategoryResponse category = categoryService.getCategoryById(id);
        return ResponseEntity.ok(Map.of("success", true, "data", category));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createCategory(@Valid @RequestBody CategoryCreateRequest request) {
        CategoryResponse category = categoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "data", category));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateCategory(@PathVariable String id, @Valid @RequestBody CategoryUpdateRequest request) {
        CategoryResponse category = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(Map.of("success", true, "data", category));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteCategory(@PathVariable String id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Category deleted successfully"));
    }
}
