package com.dalika.quotes.quote.service;

import com.dalika.quotes.common.exception.BadRequestException;
import com.dalika.quotes.common.exception.ForbiddenException;
import com.dalika.quotes.common.exception.ResourceNotFoundException;
import com.dalika.quotes.common.pagination.PaginatedResponse;
import com.dalika.quotes.quote.dto.QuoteRequestCreateDto;
import com.dalika.quotes.quote.dto.QuoteRequestResponse;
import com.dalika.quotes.quote.dto.QuoteRequestUpdateStatusDto;
import com.dalika.quotes.quote.dto.QuoteResponseCreateDto;
import com.dalika.quotes.quote.entity.QuoteItem;
import com.dalika.quotes.quote.entity.QuoteRequest;
import com.dalika.quotes.quote.entity.QuoteResponse;
import com.dalika.quotes.quote.entity.QuoteStatus;
import com.dalika.quotes.quote.repository.QuoteRequestRepository;
import com.dalika.quotes.user.entity.Role;
import com.dalika.quotes.user.entity.User;
import com.dalika.quotes.user.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class QuoteRequestService {

    private final QuoteRequestRepository quoteRequestRepository;
    private final UserRepository userRepository;

    public QuoteRequestService(QuoteRequestRepository quoteRequestRepository, UserRepository userRepository) {
        this.quoteRequestRepository = quoteRequestRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public PaginatedResponse<QuoteRequestResponse> getMyQuoteRequests(String userId, Pageable pageable) {
        return PaginatedResponse.from(
            quoteRequestRepository.findByClientIdWithItems(userId, pageable).map(this::toResponse)
        );
    }

    @Transactional(readOnly = true)
    public PaginatedResponse<QuoteRequestResponse> getAllQuoteRequests(Authentication authentication, Pageable pageable) {
        User currentUser = userRepository.findById(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", authentication.getName()));

        if (currentUser.getRole() == Role.ADMIN || currentUser.getRole() == Role.REP) {
            return PaginatedResponse.from(
                quoteRequestRepository.findAll(pageable).map(this::toResponse)
            );
        }

        return getMyQuoteRequests(currentUser.getId(), pageable);
    }

    @Transactional(readOnly = true)
    public QuoteRequestResponse getQuoteRequestById(String id, Authentication authentication) {
        QuoteRequest qr = quoteRequestRepository.findByIdWithItemsAndResponse(id)
                .orElseThrow(() -> new ResourceNotFoundException("QuoteRequest", "id", id));

        User currentUser = userRepository.findById(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", authentication.getName()));

        if (currentUser.getRole() == Role.CLIENT && !qr.getClient().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("You can only view your own quote requests");
        }

        return toResponse(qr);
    }

    @Transactional
    public QuoteRequestResponse createQuoteRequest(QuoteRequestCreateDto dto, Authentication authentication) {
        User client = userRepository.findById(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", authentication.getName()));

        if (client.getRole() != Role.CLIENT) {
            throw new ForbiddenException("Only clients can create quote requests");
        }

        QuoteRequest quoteRequest = QuoteRequest.builder()
                .title(dto.title())
                .description(dto.description())
                .status(QuoteStatus.PENDING)
                .client(client)
                .build();

        List<QuoteItem> items = dto.items().stream()
                .map(itemDto -> QuoteItem.builder()
                        .productUrl(itemDto.productUrl())
                        .productName(itemDto.productName())
                        .quantity(itemDto.quantity())
                        .quoteRequest(quoteRequest)
                        .build())
                .collect(Collectors.toList());

        quoteRequest.setItems(items);

        quoteRequestRepository.save(quoteRequest);
        return toResponse(quoteRequest);
    }

    @Transactional
    public QuoteRequestResponse updateStatus(String id, QuoteRequestUpdateStatusDto dto, Authentication authentication) {
        QuoteRequest qr = quoteRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("QuoteRequest", "id", id));

        User currentUser = userRepository.findById(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", authentication.getName()));

        if (currentUser.getRole() != Role.ADMIN && currentUser.getRole() != Role.REP) {
            throw new ForbiddenException("Only admins and reps can update quote status");
        }

        qr.setStatus(dto.status());
        if (dto.status() == QuoteStatus.QUOTED && qr.getRespondedAt() == null) {
            qr.setRespondedAt(Instant.now());
        }

        quoteRequestRepository.save(qr);
        return toResponse(qr);
    }

    @Transactional
    public QuoteRequestResponse addResponse(String id, QuoteResponseCreateDto dto, Authentication authentication) {
        QuoteRequest qr = quoteRequestRepository.findByIdWithItemsAndResponse(id)
                .orElseThrow(() -> new ResourceNotFoundException("QuoteRequest", "id", id));

        User currentUser = userRepository.findById(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", authentication.getName()));

        if (currentUser.getRole() != Role.ADMIN && currentUser.getRole() != Role.REP) {
            throw new ForbiddenException("Only admins and reps can add responses");
        }

        QuoteResponse response = QuoteResponse.builder()
                .quoteRequest(qr)
                .quoteUrl(dto.quoteUrl())
                .invoiceUrl(dto.invoiceUrl())
                .trackingUrl(dto.trackingUrl())
                .adminNotes(dto.adminNotes())
                .build();

        qr.setResponse(response);
        qr.setStatus(QuoteStatus.QUOTED);
        qr.setRespondedAt(Instant.now());

        quoteRequestRepository.save(qr);
        return toResponse(qr);
    }

    @Transactional
    public void deleteQuoteRequest(String id, Authentication authentication) {
        QuoteRequest qr = quoteRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("QuoteRequest", "id", id));

        User currentUser = userRepository.findById(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", authentication.getName()));

        if (currentUser.getRole() == Role.CLIENT && !qr.getClient().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("You can only delete your own quote requests");
        }

        quoteRequestRepository.delete(qr);
    }

    private QuoteRequestResponse toResponse(QuoteRequest qr) {
        List<QuoteRequestResponse.QuoteItemResponse> items = qr.getItems() != null
            ? qr.getItems().stream()
                .map(item -> new QuoteRequestResponse.QuoteItemResponse(
                        item.getId(),
                        item.getProductUrl(),
                        item.getProductName(),
                        item.getQuantity()
                ))
                .collect(Collectors.toList())
            : List.of();

        QuoteRequestResponse.QuoteResponseDto responseDto = null;
        if (qr.getResponse() != null) {
            QuoteResponse resp = qr.getResponse();
            responseDto = new QuoteRequestResponse.QuoteResponseDto(
                    resp.getId(),
                    resp.getQuoteUrl(),
                    resp.getInvoiceUrl(),
                    resp.getTrackingUrl(),
                    resp.getAdminNotes(),
                    resp.getCreatedAt()
            );
        }

        return new QuoteRequestResponse(
                qr.getId(),
                qr.getClient().getId(),
                qr.getClient().getName(),
                qr.getTitle(),
                qr.getDescription(),
                qr.getStatus().name(),
                items,
                responseDto,
                qr.getCreatedAt(),
                qr.getUpdatedAt(),
                qr.getRespondedAt(),
                qr.getExpiresAt()
        );
    }
}
