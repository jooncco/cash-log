package com.cashlog.dto.response;

import lombok.*;

import java.math.BigDecimal;

/**
 * One point on the monthly trend chart. {@code month} is an ISO year-month
 * string ({@code yyyy-MM}) so the client can use it directly as a chart label
 * and as the selected-month key.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonthlyTrendPointDTO {
    private String month;
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal netAmount;
    /**
     * Sum of this month's expenses flagged as fixed costs. It is a slice of
     * {@code totalExpense}, not an extra outflow on top of it.
     */
    private BigDecimal fixedCost;
    /**
     * Running balance of (income - expense) from the first ever recorded
     * transaction up to and including this month. It is intentionally not
     * limited to the queried range, so narrowing the range shifts the visible
     * window without changing the accumulated level.
     */
    private BigDecimal cumulativeSavings;
    /**
     * False for months inside the range that hold no transaction at all, which
     * lets the client tell "nothing recorded" apart from "recorded, nets zero".
     */
    private Boolean hasTransactions;
}
