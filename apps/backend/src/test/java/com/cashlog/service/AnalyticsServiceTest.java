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
    void getMonthlyTrend_fillsGapMonths_andComputesNet() {
        when(transactionRepository.aggregateMonthlyTotals(any(), any())).thenReturn(List.of(
                new Object[]{2024, 1, TransactionType.INCOME, new BigDecimal("100000")},
                new Object[]{2024, 1, TransactionType.EXPENSE, new BigDecimal("40000")},
                new Object[]{2024, 3, TransactionType.EXPENSE, new BigDecimal("25000")}
        ));
        when(transactionRepository.aggregateTotalsBefore(any())).thenReturn(List.of());

        var points = analyticsService.getMonthlyTrend(LocalDate.of(2024, 1, 1), LocalDate.of(2024, 3, 31));

        assertEquals(3, points.size());
        assertEquals("2024-01", points.get(0).getMonth());
        assertEquals(0, new BigDecimal("60000").compareTo(points.get(0).getNetAmount()));

        // February has no transactions but must still appear as a zero point.
        assertEquals("2024-02", points.get(1).getMonth());
        assertEquals(0, BigDecimal.ZERO.compareTo(points.get(1).getTotalIncome()));
        assertEquals(0, BigDecimal.ZERO.compareTo(points.get(1).getNetAmount()));

        assertEquals("2024-03", points.get(2).getMonth());
        assertEquals(0, new BigDecimal("-25000").compareTo(points.get(2).getNetAmount()));
    }

    @Test
    void getMonthlyTrend_flagsMonthsWithoutTransactions() {
        when(transactionRepository.aggregateMonthlyTotals(any(), any())).thenReturn(List.<Object[]>of(
                new Object[]{2024, 1, TransactionType.INCOME, new BigDecimal("100000")},
                new Object[]{2024, 3, TransactionType.EXPENSE, new BigDecimal("25000")}
        ));
        when(transactionRepository.aggregateTotalsBefore(any())).thenReturn(List.of());

        var points = analyticsService.getMonthlyTrend(LocalDate.of(2024, 1, 1), LocalDate.of(2024, 3, 31));

        assertTrue(points.get(0).getHasTransactions());
        assertFalse(points.get(1).getHasTransactions());
        assertTrue(points.get(2).getHasTransactions());
    }

    @Test
    void getMonthlyTrend_accumulatesSavings_carryingGapMonthsForward() {
        when(transactionRepository.aggregateMonthlyTotals(any(), any())).thenReturn(List.of(
                new Object[]{2024, 1, TransactionType.INCOME, new BigDecimal("100000")},
                new Object[]{2024, 1, TransactionType.EXPENSE, new BigDecimal("40000")},
                new Object[]{2024, 3, TransactionType.EXPENSE, new BigDecimal("25000")}
        ));
        when(transactionRepository.aggregateTotalsBefore(any())).thenReturn(List.of());

        var points = analyticsService.getMonthlyTrend(LocalDate.of(2024, 1, 1), LocalDate.of(2024, 3, 31));

        assertEquals(0, new BigDecimal("60000").compareTo(points.get(0).getCumulativeSavings()));
        // A month without transactions keeps the previous level.
        assertEquals(0, new BigDecimal("60000").compareTo(points.get(1).getCumulativeSavings()));
        assertEquals(0, new BigDecimal("35000").compareTo(points.get(2).getCumulativeSavings()));
    }

    @Test
    void getMonthlyTrend_reportsFixedCostsPerMonth_zeroWhereNoneRecorded() {
        when(transactionRepository.aggregateMonthlyTotals(any(), any())).thenReturn(List.of(
                new Object[]{2024, 1, TransactionType.EXPENSE, new BigDecimal("400000")},
                new Object[]{2024, 3, TransactionType.EXPENSE, new BigDecimal("250000")}
        ));
        when(transactionRepository.aggregateMonthlyFixedCosts(any(), any(), eq(TransactionType.EXPENSE)))
                .thenReturn(List.<Object[]>of(
                        new Object[]{2024, 1, new BigDecimal("150000")},
                        new Object[]{2024, 3, new BigDecimal("150000")}
                ));
        when(transactionRepository.aggregateTotalsBefore(any())).thenReturn(List.of());

        var points = analyticsService.getMonthlyTrend(LocalDate.of(2024, 1, 1), LocalDate.of(2024, 3, 31));

        assertEquals(0, new BigDecimal("150000").compareTo(points.get(0).getFixedCost()));
        // February has no transaction at all, so it charts a zero rather than a gap.
        assertEquals(0, BigDecimal.ZERO.compareTo(points.get(1).getFixedCost()));
        assertEquals(0, new BigDecimal("150000").compareTo(points.get(2).getFixedCost()));
    }

    @Test
    void getMonthlyTrend_seedsSavingsWithBalanceBeforeRange() {
        when(transactionRepository.aggregateMonthlyTotals(any(), any())).thenReturn(List.<Object[]>of(
                new Object[]{2024, 5, TransactionType.INCOME, new BigDecimal("10000")}
        ));
        when(transactionRepository.aggregateTotalsBefore(LocalDate.of(2024, 5, 1))).thenReturn(List.<Object[]>of(
                new Object[]{TransactionType.INCOME, new BigDecimal("500000")},
                new Object[]{TransactionType.EXPENSE, new BigDecimal("200000")}
        ));

        var points = analyticsService.getMonthlyTrend(LocalDate.of(2024, 5, 1), LocalDate.of(2024, 5, 31));

        assertEquals(1, points.size());
        assertEquals(0, new BigDecimal("10000").compareTo(points.get(0).getNetAmount()));
        // 300,000 carried in from before the range + 10,000 earned in May.
        assertEquals(0, new BigDecimal("310000").compareTo(points.get(0).getCumulativeSavings()));
    }

    @Test
    void getMonthlyTrend_withoutBounds_usesFullRecordedRange() {
        when(transactionRepository.findEarliestTransactionDate()).thenReturn(LocalDate.of(2023, 11, 20));
        when(transactionRepository.findLatestTransactionDate()).thenReturn(LocalDate.of(2024, 1, 5));
        when(transactionRepository.aggregateMonthlyTotals(LocalDate.of(2023, 11, 20), LocalDate.of(2024, 1, 5)))
                .thenReturn(List.of());
        when(transactionRepository.aggregateTotalsBefore(any())).thenReturn(List.of());

        var points = analyticsService.getMonthlyTrend(null, null);

        assertEquals(List.of("2023-11", "2023-12", "2024-01"),
                points.stream().map(p -> p.getMonth()).toList());
    }

    @Test
    void getMonthlyTrend_returnsEmpty_whenNoTransactionsExist() {
        when(transactionRepository.findEarliestTransactionDate()).thenReturn(null);
        when(transactionRepository.findLatestTransactionDate()).thenReturn(null);

        assertTrue(analyticsService.getMonthlyTrend(null, null).isEmpty());
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
