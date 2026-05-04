package com.dalika.quotes.quote.controller;

import com.dalika.quotes.common.pagination.PaginatedResponse;
import com.dalika.quotes.quote.dto.QuoteRequestCreateDto;
import com.dalika.quotes.quote.dto.QuoteRequestResponse;
import com.dalika.quotes.quote.dto.QuoteRequestUpdateStatusDto;
import com.dalika.quotes.quote.dto.QuoteResponseCreateDto;
import com.dalika.quotes.quote.service.QuoteRequestService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/quote-requests")
public class QuoteRequestController {

    private final QuoteRequestService quoteRequestService;

    public QuoteRequestController(QuoteRequestService quoteRequestService) {
        this.quoteRequestService = quoteRequestService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllQuoteRequests(
            @PageableDefault(size = 20) Pageable pageable,
            Authentication authentication
    ) {
        PaginatedResponse<QuoteRequestResponse> requests = quoteRequestService.getAllQuoteRequests(authentication, pageable);
        return ResponseEntity.ok(Map.of("success", true, "data", requests));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getQuoteRequestById(@PathVariable String id, Authentication authentication) {
        QuoteRequestResponse request = quoteRequestService.getQuoteRequestById(id, authentication);
        return ResponseEntity.ok(Map.of("success", true, "data", request));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createQuoteRequest(
            @Valid @RequestBody QuoteRequestCreateDto dto,
            Authentication authentication
    ) {
        QuoteRequestResponse request = quoteRequestService.createQuoteRequest(dto, authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "data", request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateStatus(
            @PathVariable String id,
            @Valid @RequestBody QuoteRequestUpdateStatusDto dto,
            Authentication authentication
    ) {
        QuoteRequestResponse request = quoteRequestService.updateStatus(id, dto, authentication);
        return ResponseEntity.ok(Map.of("success", true, "data", request));
    }

    @PostMapping("/{id}/response")
    public ResponseEntity<Map<String, Object>> addResponse(
            @PathVariable String id,
            @Valid @RequestBody QuoteResponseCreateDto dto,
            Authentication authentication
    ) {
        QuoteRequestResponse request = quoteRequestService.addResponse(id, dto, authentication);
        return ResponseEntity.ok(Map.of("success", true, "data", request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteQuoteRequest(@PathVariable String id, Authentication authentication) {
        quoteRequestService.deleteQuoteRequest(id, authentication);
        return ResponseEntity.ok(Map.of("success", true, "message", "Quote request deleted successfully"));
    }
}
