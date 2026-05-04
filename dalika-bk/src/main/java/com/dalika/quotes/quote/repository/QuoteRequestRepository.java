package com.dalika.quotes.quote.repository;

import com.dalika.quotes.quote.entity.QuoteRequest;
import com.dalika.quotes.quote.entity.QuoteStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface QuoteRequestRepository extends JpaRepository<QuoteRequest, String> {

    Page<QuoteRequest> findByClientId(String clientId, Pageable pageable);

    Page<QuoteRequest> findByStatus(QuoteStatus status, Pageable pageable);

    @Query("SELECT qr FROM QuoteRequest qr LEFT JOIN FETCH qr.items LEFT JOIN FETCH qr.response WHERE qr.id = :id")
    Optional<QuoteRequest> findByIdWithItemsAndResponse(@Param("id") String id);

    @Query("SELECT qr FROM QuoteRequest qr WHERE qr.client.id = :clientId AND qr.status = :status")
    Page<QuoteRequest> findByClientIdAndStatus(@Param("clientId") String clientId, @Param("status") QuoteStatus status, Pageable pageable);

    @Query("SELECT qr FROM QuoteRequest qr LEFT JOIN FETCH qr.items WHERE qr.client.id = :clientId")
    Page<QuoteRequest> findByClientIdWithItems(@Param("clientId") String clientId, Pageable pageable);
}
