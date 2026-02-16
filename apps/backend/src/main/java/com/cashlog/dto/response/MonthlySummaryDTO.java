package com.cashlog.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonthlySummaryDTO {
    private Integer year;
    private Integer month;
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal netAmount;
    private BigDecimal budgetTarget;
    private BigDecimal budgetRemaining;
    private Double budgetUsagePercentage;
    private String alertLevel;
}
