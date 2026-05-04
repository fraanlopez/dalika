package com.dalika.quotes.category.repository;

import com.dalika.quotes.category.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, String> {

    Page<Category> findByNameContainingIgnoreCase(String name, Pageable pageable);

    Optional<Category> findByName(String name);

    boolean existsByName(String name);

    @Query("SELECT c, COUNT(b) FROM Category c LEFT JOIN c.brands b GROUP BY c.id")
    Page<Object[]> findWithBrandCount(Pageable pageable);
}
