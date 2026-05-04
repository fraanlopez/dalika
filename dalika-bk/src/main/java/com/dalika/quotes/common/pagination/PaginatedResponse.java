package com.dalika.quotes.common.pagination;

import org.springframework.data.domain.Page;
import java.util.List;

public record PaginatedResponse<T>(
    List<T> data,
    long total,
    int page,
    int size,
    int totalPages
) {
    public static <T> PaginatedResponse<T> from(Page<T> page) {
        return new PaginatedResponse<>(
            page.getContent(),
            page.getTotalElements(),
            page.getNumber(),
            page.getSize(),
            page.getTotalPages()
        );
    }
}
