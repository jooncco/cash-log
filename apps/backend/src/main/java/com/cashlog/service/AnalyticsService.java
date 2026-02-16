package com.cashlog.service;

import com.cashlog.dto.response.MonthlySummaryDTO;
import com.cashlog.entity.Budget;
import com.cashlog.entity.TransactionType;
import com.cashlog.repository.BudgetRepository;
import com.cashlog.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsService {
    
    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    
    public MonthlySummaryDTO getMonthlySummary(Integer year, Integer month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);
        
        BigDecimal totalIncome = transactionRepository.sumAmountByDateRangeAndType(
                startDate, endDate, TransactionType.INCOME);
        if (totalIncome == null) totalIncome = BigDecimal.ZERO;
        
        BigDecimal totalExpense = transactionRepository.sumAmountByDateRangeAndType(
                startDate, endDate, TransactionType.EXPENSE);
        if (totalExpense == null) totalExpense = BigDecimal.ZERO;
        
        BigDecimal netAmount = totalIncome.subtract(totalExpense);
        
        Budget budget = budgetRepository.findByYearAndMonth(year, month).orElse(null);
        BigDecimal budgetTarget = budget != null ? budget.getTargetAmount() : null;
        BigDecimal budgetRemaining = budgetTarget != null ? budgetTarget.subtract(totalExpense) : null;
        Double budgetUsagePercentage = null;
        String alertLevel = "NONE";
        
        if (budgetTarget != null && budgetTarget.compareTo(BigDecimal.ZERO) > 0) {
            budgetUsagePercentage = totalExpense.divide(budgetTarget, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)).doubleValue();
            
            if (budgetUsagePercentage >= 100) {
                alertLevel = "RED";
            } else if (budgetUsagePercentage >= 80) {
                alertLevel = "YELLOW";
            } else {
                alertLevel = "GREEN";
            }
        }
        
        return MonthlySummaryDTO.builder()
                .year(year)
                .month(month)
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .netAmount(netAmount)
                .budgetTarget(budgetTarget)
                .budgetRemaining(budgetRemaining)
                .budgetUsagePercentage(budgetUsagePercentage)
                .alertLevel(alertLevel)
                .build();
    }
}
