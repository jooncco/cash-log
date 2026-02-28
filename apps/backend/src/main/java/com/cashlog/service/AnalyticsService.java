package com.cashlog.service;

import com.cashlog.dto.response.MonthlySummaryDTO;
import com.cashlog.entity.TransactionType;
import com.cashlog.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsService {
    
    private final TransactionRepository transactionRepository;
    
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
        
        return MonthlySummaryDTO.builder()
                .year(year)
                .month(month)
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .netAmount(netAmount)
                .budgetTarget(null)
                .budgetRemaining(null)
                .budgetUsagePercentage(null)
                .alertLevel("NONE")
                .build();
    }
}
