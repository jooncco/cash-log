package com.cashlog.controller;

import com.cashlog.dto.response.BreakdownItemDTO;
import com.cashlog.dto.response.MonthlySummaryDTO;
import com.cashlog.dto.response.MonthlyTrendPointDTO;
import com.cashlog.entity.TransactionType;
import com.cashlog.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "Analytics and reporting APIs")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/monthly-summary")
    @Operation(summary = "Get monthly income/expense/net summary")
    public ResponseEntity<MonthlySummaryDTO> getMonthlySummary(
            @RequestParam Integer year,
            @RequestParam Integer month) {
        MonthlySummaryDTO summary = analyticsService.getMonthlySummary(year, month);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/monthly-trend")
    @Operation(summary = "Get per-month income/expense/net totals; omit dates for the full history")
    public ResponseEntity<List<MonthlyTrendPointDTO>> getMonthlyTrend(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(analyticsService.getMonthlyTrend(startDate, endDate));
    }

    @GetMapping("/category-breakdown")
    @Operation(summary = "Get monthly amount breakdown by category for a transaction type")
    public ResponseEntity<List<BreakdownItemDTO>> getCategoryBreakdown(
            @RequestParam Integer year,
            @RequestParam Integer month,
            @RequestParam(required = false, defaultValue = "EXPENSE") TransactionType type) {
        return ResponseEntity.ok(analyticsService.getCategoryBreakdown(year, month, type));
    }

    @GetMapping("/tag-breakdown")
    @Operation(summary = "Get monthly amount breakdown by tag for a transaction type")
    public ResponseEntity<List<BreakdownItemDTO>> getTagBreakdown(
            @RequestParam Integer year,
            @RequestParam Integer month,
            @RequestParam(required = false, defaultValue = "EXPENSE") TransactionType type) {
        return ResponseEntity.ok(analyticsService.getTagBreakdown(year, month, type));
    }
}
