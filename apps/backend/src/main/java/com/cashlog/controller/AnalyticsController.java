package com.cashlog.controller;

import com.cashlog.dto.response.MonthlySummaryDTO;
import com.cashlog.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "Analytics and reporting APIs")
public class AnalyticsController {
    
    private final AnalyticsService analyticsService;
    
    @GetMapping("/monthly-summary")
    @Operation(summary = "Get monthly summary with budget alerts")
    public ResponseEntity<MonthlySummaryDTO> getMonthlySummary(
            @RequestParam Integer year,
            @RequestParam Integer month) {
        MonthlySummaryDTO summary = analyticsService.getMonthlySummary(year, month);
        return ResponseEntity.ok(summary);
    }
}
