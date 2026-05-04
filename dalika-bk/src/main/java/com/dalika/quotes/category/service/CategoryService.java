package com.dalika.quotes.category.service;

import com.dalika.quotes.category.dto.CategoryCreateRequest;
import com.dalika.quotes.category.dto.CategoryResponse;
import com.dalika.quotes.category.dto.CategoryUpdateRequest;
import com.dalika.quotes.category.entity.Category;
import com.dalika.quotes.category.repository.CategoryRepository;
import com.dalika.quotes.common.exception.ConflictException;
import com.dalika.quotes.common.exception.ResourceNotFoundException;
import com.dalika.quotes.common.pagination.PaginatedResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public PaginatedResponse<CategoryResponse> getAllCategories(Pageable pageable) {
        Page<Object[]> page = categoryRepository.findWithBrandCount(pageable);
        return PaginatedResponse.from(
            page.map(obj -> new CategoryResponse(
                ((Category) obj[0]).getId(),
                ((Category) obj[0]).getName(),
                ((Category) obj[0]).getDescription(),
                (Long) obj[1],
                ((Category) obj[0]).getCreatedAt(),
                ((Category) obj[0]).getUpdatedAt()
            ))
        );
    }

    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(String id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        return toResponse(category);
    }

    @Transactional
    public CategoryResponse createCategory(CategoryCreateRequest request) {
        if (categoryRepository.existsByName(request.name())) {
            throw new ConflictException("Category with name '" + request.name() + "' already exists");
        }

        Category category = Category.builder()
                .name(request.name())
                .description(request.description())
                .build();

        categoryRepository.save(category);
        return toResponse(category);
    }

    @Transactional
    public CategoryResponse updateCategory(String id, CategoryUpdateRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        if (request.name() != null) {
            categoryRepository.findByName(request.name())
                    .filter(c -> !c.getId().equals(id))
                    .ifPresent(c -> {
                        throw new ConflictException("Category with name '" + request.name() + "' already exists");
                    });
            category.setName(request.name());
        }
        if (request.description() != null) {
            category.setDescription(request.description());
        }

        categoryRepository.save(category);
        return toResponse(category);
    }

    @Transactional
    public void deleteCategory(String id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Category", "id", id);
        }
        categoryRepository.deleteById(id);
    }

    private CategoryResponse toResponse(Category category) {
        long brandCount = category.getBrands() != null ? category.getBrands().size() : 0;
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getDescription(),
                brandCount,
                category.getCreatedAt(),
                category.getUpdatedAt()
        );
    }
}
