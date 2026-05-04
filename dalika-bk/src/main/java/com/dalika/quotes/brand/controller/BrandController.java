package com.dalika.quotes.brand.controller;

import com.dalika.quotes.brand.dto.BrandCreateRequest;
import com.dalika.quotes.brand.dto.BrandResponse;
import com.dalika.quotes.brand.dto.BrandUpdateRequest;
import com.dalika.quotes.brand.service.BrandService;
import com.dalika.quotes.common.pagination.PaginatedResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/brands")
public class BrandController {

    private final BrandService brandService;

    public BrandController(BrandService brandService) {
        this.brandService = brandService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllBrands(
            @PageableDefault(size = 20) Pageable pageable,
            @RequestParam(required = false) Boolean activeOnly
    ) {
        PaginatedResponse<BrandResponse> brands = brandService.getAllBrands(pageable, activeOnly);
        return ResponseEntity.ok(Map.of("success", true, "data", brands));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getBrandById(@PathVariable String id) {
        BrandResponse brand = brandService.getBrandById(id);
        return ResponseEntity.ok(Map.of("success", true, "data", brand));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createBrand(@Valid @RequestBody BrandCreateRequest request) {
        BrandResponse brand = brandService.createBrand(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "data", brand));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateBrand(@PathVariable String id, @Valid @RequestBody BrandUpdateRequest request) {
        BrandResponse brand = brandService.updateBrand(id, request);
        return ResponseEntity.ok(Map.of("success", true, "data", brand));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteBrand(@PathVariable String id) {
        brandService.deleteBrand(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Brand deleted successfully"));
    }
}
