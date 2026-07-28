package com.cashlog.service;

import com.cashlog.dto.response.BreakdownItemDTO;
import com.cashlog.dto.response.MonthlySummaryDTO;
import com.cashlog.entity.Category;
import com.cashlog.entity.Tag;
import com.cashlog.entity.Transaction;
import com.cashlog.entity.TransactionType;
import com.cashlog.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
                .build();
    }

    /**
     * Server-side category breakdown for a given month/type, replacing the
     * client-side aggregation that used to require the full transaction list.
     */
    public List<BreakdownItemDTO> getCategoryBreakdown(Integer year, Integer month, TransactionType type) {
        List<Transaction> transactions = transactionsForMonth(year, month, type);

        Map<Long, BreakdownAccumulator> grouped = new LinkedHashMap<>();
        BigDecimal total = BigDecimal.ZERO;
        for (Transaction tx : transactions) {
            Category category = tx.getCategory();
            Long key = category != null ? category.getId() : -1L;
            String name = category != null ? category.getName() : "Unknown";
            String color = category != null ? category.getColor() : "#6b7280";
            grouped.computeIfAbsent(key, k -> new BreakdownAccumulator(key, name, color))
                    .add(tx.getAmountKrw());
            total = total.add(tx.getAmountKrw());
        }
        return toBreakdownList(grouped.values(), total);
    }

    /**
     * Server-side tag breakdown for a given month/type. A transaction can
     * carry multiple tags, so per-tag percentages are shares of the type's
     * monthly total rather than a mutually-exclusive partition of it.
     */
    public List<BreakdownItemDTO> getTagBreakdown(Integer year, Integer month, TransactionType type) {
        List<Transaction> transactions = transactionsForMonth(year, month, type);

        Map<Long, BreakdownAccumulator> grouped = new LinkedHashMap<>();
        BigDecimal total = BigDecimal.ZERO;
        for (Transaction tx : transactions) {
            total = total.add(tx.getAmountKrw());
            for (Tag tag : tx.getTags()) {
                grouped.computeIfAbsent(tag.getId(), k -> new BreakdownAccumulator(tag.getId(), tag.getName(), tag.getColor()))
                        .add(tx.getAmountKrw());
            }
        }
        return toBreakdownList(grouped.values(), total);
    }

    private List<Transaction> transactionsForMonth(Integer year, Integer month, TransactionType type) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);
        return transactionRepository.findByDateRangeAndType(startDate, endDate, type);
    }

    private List<BreakdownItemDTO> toBreakdownList(Collection<BreakdownAccumulator> accumulators, BigDecimal total) {
        return accumulators.stream()
                .sorted((a, b) -> b.amount.compareTo(a.amount))
                .map(acc -> BreakdownItemDTO.builder()
                        .id(acc.id)
                        .name(acc.name)
                        .color(acc.color)
                        .amount(acc.amount)
                        .percentage(total.compareTo(BigDecimal.ZERO) == 0
                                ? 0.0
                                : acc.amount.multiply(BigDecimal.valueOf(100))
                                        .divide(total, 2, RoundingMode.HALF_UP)
                                        .doubleValue())
                        .build())
                .collect(Collectors.toList());
    }

    private static class BreakdownAccumulator {
        final Long id;
        final String name;
        final String color;
        BigDecimal amount = BigDecimal.ZERO;

        BreakdownAccumulator(Long id, String name, String color) {
            this.id = id;
            this.name = name;
            this.color = color;
        }

        void add(BigDecimal value) {
            amount = amount.add(value);
        }
    }
}
