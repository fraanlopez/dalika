package com.dalika.quotes.brand.repository;

import com.dalika.quotes.brand.entity.Brand;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface BrandRepository extends JpaRepository<Brand, String> {

    Page<Brand> findByIsActiveTrue(Pageable pageable);

    Optional<Brand> findByName(String name);

    boolean existsByName(String name);

    @Query("SELECT b FROM Brand b LEFT JOIN FETCH b.categories WHERE b.id = :id")
    Optional<Brand> findByIdWithCategories(String id);
}
