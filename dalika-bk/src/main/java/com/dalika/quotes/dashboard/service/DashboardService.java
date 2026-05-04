package com.dalika.quotes.dashboard.service;

import com.dalika.quotes.brand.repository.BrandRepository;
import com.dalika.quotes.dashboard.dto.DashboardMetricsDto;
import com.dalika.quotes.quote.dto.QuoteRequestResponse;
import com.dalika.quotes.quote.entity.QuoteRequest;
import com.dalika.quotes.quote.entity.QuoteStatus;
import com.dalika.quotes.quote.repository.QuoteRequestRepository;
import com.dalika.quotes.user.entity.Role;
import com.dalika.quotes.user.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DashboardService {

    private final QuoteRequestRepository quoteRequestRepository;
    private final BrandRepository brandRepository;
    private final UserRepository userRepository;

    public DashboardService(QuoteRequestRepository quoteRequestRepository,
                           BrandRepository brandRepository,
                           UserRepository userRepository) {
        this.quoteRequestRepository = quoteRequestRepository;
        this.brandRepository = brandRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public DashboardMetricsDto getMetrics(Authentication authentication) {
        String userId = authentication.getName();
        String email = authentication.getName();
        var userOpt = userRepository.findByEmail(email);
        Role userRole = userOpt.map(u -> u.getRole()).orElse(Role.CLIENT);

        long totalQuoteRequests;
        long pendingQuoteRequests;
        long quotedQuoteRequests;
        long expiredQuoteRequests;
        List<QuoteRequest> recentQuotes;

        if (userRole == Role.CLIENT) {
            String clientId = userOpt.map(u -> u.getId()).orElse(userId);
            totalQuoteRequests = quoteRequestRepository.findByClientId(clientId, PageRequest.of(0, 1)).getTotalElements();
            pendingQuoteRequests = quoteRequestRepository.findByClientIdAndStatus(clientId, QuoteStatus.PENDING, PageRequest.of(0, 1)).getTotalElements();
            quotedQuoteRequests = quoteRequestRepository.findByClientIdAndStatus(clientId, QuoteStatus.QUOTED, PageRequest.of(0, 1)).getTotalElements();
            expiredQuoteRequests = quoteRequestRepository.findByClientIdAndStatus(clientId, QuoteStatus.EXPIRED, PageRequest.of(0, 1)).getTotalElements();
            recentQuotes = quoteRequestRepository.findByClientIdWithItems(clientId, PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "createdAt"))).getContent();
        } else {
            totalQuoteRequests = quoteRequestRepository.count();
            pendingQuoteRequests = quoteRequestRepository.findByStatus(QuoteStatus.PENDING, PageRequest.of(0, 1)).getTotalElements();
            quotedQuoteRequests = quoteRequestRepository.findByStatus(QuoteStatus.QUOTED, PageRequest.of(0, 1)).getTotalElements();
            expiredQuoteRequests = quoteRequestRepository.findByStatus(QuoteStatus.EXPIRED, PageRequest.of(0, 1)).getTotalElements();
            recentQuotes = quoteRequestRepository.findAll(PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "createdAt"))).getContent();
        }

        long totalBrands = brandRepository.count();
        long totalClients = userRepository.count();

        List<QuoteRequestResponse> recentQuoteRequests = recentQuotes.stream()
            .map(this::toResponse)
            .toList();

        return new DashboardMetricsDto(
            totalQuoteRequests,
            pendingQuoteRequests,
            quotedQuoteRequests,
            expiredQuoteRequests,
            totalBrands,
            totalClients,
            recentQuoteRequests
        );
    }

    private QuoteRequestResponse toResponse(QuoteRequest qr) {
        return new QuoteRequestResponse(
            qr.getId(),
            qr.getClient().getId(),
            qr.getClient().getName(),
            qr.getTitle(),
            qr.getDescription(),
            qr.getStatus().name(),
            qr.getItems().stream()
                .map(item -> new QuoteRequestResponse.QuoteItemResponse(
                    item.getId(),
                    item.getProductUrl(),
                    item.getProductName(),
                    item.getQuantity()
                ))
                .toList(),
            qr.getResponse() != null ? new QuoteRequestResponse.QuoteResponseDto(
                qr.getResponse().getId(),
                qr.getResponse().getQuoteUrl(),
                qr.getResponse().getInvoiceUrl(),
                qr.getResponse().getTrackingUrl(),
                qr.getResponse().getAdminNotes(),
                qr.getResponse().getCreatedAt()
            ) : null,
            qr.getCreatedAt(),
            qr.getUpdatedAt(),
            qr.getRespondedAt(),
            qr.getExpiresAt()
        );
    }
}
