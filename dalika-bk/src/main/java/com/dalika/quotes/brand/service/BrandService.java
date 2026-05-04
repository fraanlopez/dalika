package com.dalika.quotes.brand.service;

import com.dalika.quotes.brand.dto.BrandCreateRequest;
import com.dalika.quotes.brand.dto.BrandResponse;
import com.dalika.quotes.brand.dto.BrandUpdateRequest;
import com.dalika.quotes.brand.entity.Brand;
import com.dalika.quotes.brand.repository.BrandRepository;
import com.dalika.quotes.category.entity.Category;
import com.dalika.quotes.category.repository.CategoryRepository;
import com.dalika.quotes.common.exception.ConflictException;
import com.dalika.quotes.common.exception.ResourceNotFoundException;
import com.dalika.quotes.common.pagination.PaginatedResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Service
public class BrandService {

    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;

    public BrandService(BrandRepository brandRepository, CategoryRepository categoryRepository) {
        this.brandRepository = brandRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public PaginatedResponse<BrandResponse> getAllBrands(Pageable pageable, Boolean activeOnly) {
        if (Boolean.TRUE.equals(activeOnly)) {
            return PaginatedResponse.from(
                brandRepository.findByIsActiveTrue(pageable).map(this::toResponse)
            );
        }
        return PaginatedResponse.from(
            brandRepository.findAll(pageable).map(this::toResponse)
        );
    }

    @Transactional(readOnly = true)
    public BrandResponse getBrandById(String id) {
        Brand brand = brandRepository.findByIdWithCategories(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand", "id", id));
        return toResponse(brand);
    }

    @Transactional
    public BrandResponse createBrand(BrandCreateRequest request) {
        brandRepository.findByName(request.name())
                .ifPresent(b -> {
                    throw new ConflictException("Brand with name '" + request.name() + "' already exists");
                });

        Set<Category> categories = new HashSet<>();
        if (request.categoryIds() != null) {
            request.categoryIds().forEach(id -> {
                Category category = categoryRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
                categories.add(category);
            });
        }

        Brand brand = Brand.builder()
                .name(request.name())
                .description(request.description())
                .logoUrl(request.logoUrl())
                .externalLink(request.externalLink())
                .categories(categories)
                .build();

        brandRepository.save(brand);
        return toResponse(brand);
    }

    @Transactional
    public BrandResponse updateBrand(String id, BrandUpdateRequest request) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand", "id", id));

        if (request.name() != null) {
            brandRepository.findByName(request.name())
                    .filter(b -> !b.getId().equals(id))
                    .ifPresent(b -> {
                        throw new ConflictException("Brand with name '" + request.name() + "' already exists");
                    });
            brand.setName(request.name());
        }
        if (request.description() != null) {
            brand.setDescription(request.description());
        }
        if (request.logoUrl() != null) {
            brand.setLogoUrl(request.logoUrl());
        }
        if (request.externalLink() != null) {
            brand.setExternalLink(request.externalLink());
        }
        if (request.isActive() != null) {
            brand.setIsActive(request.isActive());
        }
        if (request.categoryIds() != null) {
            Set<Category> categories = new HashSet<>();
            request.categoryIds().forEach(catId -> {
                Category category = categoryRepository.findById(catId)
                        .orElseThrow(() -> new ResourceNotFoundException("Category", "id", catId));
                categories.add(category);
            });
            brand.setCategories(categories);
        }

        brandRepository.save(brand);
        return toResponse(brand);
    }

    @Transactional
    public void deleteBrand(String id) {
        if (!brandRepository.existsById(id)) {
            throw new ResourceNotFoundException("Brand", "id", id);
        }
        brandRepository.deleteById(id);
    }

    private BrandResponse toResponse(Brand brand) {
        Set<BrandResponse.CategorySummary> categorySummaries = brand.getCategories() != null
            ? brand.getCategories().stream()
                .map(c -> new BrandResponse.CategorySummary(c.getId(), c.getName()))
                .collect(java.util.stream.Collectors.toSet())
            : Set.of();

        return new BrandResponse(
                brand.getId(),
                brand.getName(),
                brand.getDescription(),
                brand.getLogoUrl(),
                brand.getExternalLink(),
                brand.getIsActive(),
                categorySummaries,
                brand.getCreatedAt(),
                brand.getUpdatedAt()
        );
    }
}
