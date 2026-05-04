package com.dalika.quotes.dashboard.controller;

import com.dalika.quotes.dashboard.dto.DashboardMetricsDto;
import com.dalika.quotes.dashboard.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getMetrics(Authentication authentication) {
        DashboardMetricsDto metrics = dashboardService.getMetrics(authentication);
        return ResponseEntity.ok(Map.of("success", true, "data", metrics));
    }
}
