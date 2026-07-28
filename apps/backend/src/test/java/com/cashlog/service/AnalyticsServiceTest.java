package com.cashlog.service;

import com.cashlog.dto.response.BreakdownItemDTO;
import com.cashlog.entity.Category;
import com.cashlog.entity.Tag;
import com.cashlog.entity.Transaction;
import com.cashlog.entity.TransactionType;
import com.cashlog.repository.TransactionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AnalyticsServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @InjectMocks
    private AnalyticsService analyticsService;

    private Transaction expense(BigDecimal amount, Category category, Tag... tags) {
        Set<Tag> tagSet = new HashSet<>(List.of(tags));
        return Transaction.builder()
                .transactionDate(LocalDate.of(2024, 3, 10))
                .transactionType(TransactionType.EXPENSE)
                .originalAmount(amount)
                .originalCurrency("KRW")
                .amountKrw(amount)
                .category(category)
                .tags(tagSet)
                .build();
    }

    @Test
    void getMonthlySummary_computesNetAmount_withoutBudgetFields() {
        when(transactionRepository.sumAmountByDateRangeAndType(any(), any(), eq(TransactionType.INCOME)))
                .thenReturn(new BigDecimal("100000"));
        when(transactionRepository.sumAmountByDateRangeAndType(any(), any(), eq(TransactionType.EXPENSE)))
                .thenReturn(new BigDecimal("40000"));

        var summary = analyticsService.getMonthlySummary(2024, 3);

        assertEquals(2024, summary.getYear());
        assertEquals(3, summary.getMonth());
        assertEquals(0, new BigDecimal("100000").compareTo(summary.getTotalIncome()));
        assertEquals(0, new BigDecimal("40000").compareTo(summary.getTotalExpense()));
        assertEquals(0, new BigDecimal("60000").compareTo(summary.getNetAmount()));
    }

    @Test
    void getMonthlySummary_treatsNullSums_asZero() {
        when(transactionRepository.sumAmountByDateRangeAndType(any(), any(), any())).thenReturn(null);

        var summary = analyticsService.getMonthlySummary(2024, 3);

        assertEquals(0, BigDecimal.ZERO.compareTo(summary.getTotalIncome()));
        assertEquals(0, BigDecimal.ZERO.compareTo(summary.getTotalExpense()));
        assertEquals(0, BigDecimal.ZERO.compareTo(summary.getNetAmount()));
    }

    @Test
    void getCategoryBreakdown_groupsByCategory_andComputesPercentage() {
        Category food = Category.builder().id(1L).name("Food").color("#ff0000").build();
        Category transport = Category.builder().id(2L).name("Transport").color("#00ff00").build();

        when(transactionRepository.findByDateRangeAndType(any(), any(), eq(TransactionType.EXPENSE)))
                .thenReturn(List.of(
                        expense(new BigDecimal("30000"), food),
                        expense(new BigDecimal("10000"), food),
                        expense(new BigDecimal("20000"), transport)
                ));

        List<BreakdownItemDTO> breakdown = analyticsService.getCategoryBreakdown(2024, 3, TransactionType.EXPENSE);

        assertEquals(2, breakdown.size());
        BreakdownItemDTO foodItem = breakdown.stream().filter(b -> b.getId().equals(1L)).findFirst().orElseThrow();
        assertEquals(0, new BigDecimal("40000").compareTo(foodItem.getAmount()));
        assertEquals(66.67, foodItem.getPercentage(), 0.01);

        BreakdownItemDTO transportItem = breakdown.stream().filter(b -> b.getId().equals(2L)).findFirst().orElseThrow();
        assertEquals(0, new BigDecimal("20000").compareTo(transportItem.getAmount()));
        assertEquals(33.33, transportItem.getPercentage(), 0.01);
    }

    @Test
    void getTagBreakdown_countsTransactionOncePerTag() {
        Category category = Category.builder().id(1L).name("Food").color("#ff0000").build();
        Tag lunch = Tag.builder().id(1L).name("lunch").color("#111111").build();
        Tag work = Tag.builder().id(2L).name("work").color("#222222").build();

        when(transactionRepository.findByDateRangeAndType(any(), any(), eq(TransactionType.EXPENSE)))
                .thenReturn(List.of(expense(new BigDecimal("10000"), category, lunch, work)));

        List<BreakdownItemDTO> breakdown = analyticsService.getTagBreakdown(2024, 3, TransactionType.EXPENSE);

        assertEquals(2, breakdown.size());
        assertTrue(breakdown.stream().allMatch(b -> new BigDecimal("10000").compareTo(b.getAmount()) == 0));
    }

    @Test
    void getCategoryBreakdown_returnsEmptyList_whenNoTransactions() {
        when(transactionRepository.findByDateRangeAndType(any(), any(), any())).thenReturn(List.of());

        List<BreakdownItemDTO> breakdown = analyticsService.getCategoryBreakdown(2024, 3, TransactionType.EXPENSE);

        assertTrue(breakdown.isEmpty());
    }
}
