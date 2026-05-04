package com.dalika.quotes.dashboard.dto;

import com.dalika.quotes.quote.dto.QuoteRequestResponse;
import java.util.List;

public record DashboardMetricsDto(
    long totalQuoteRequests,
    long pendingQuoteRequests,
    long quotedQuoteRequests,
    long expiredQuoteRequests,
    long totalBrands,
    long totalClients,
    List<QuoteRequestResponse> recentQuoteRequests
) {}
