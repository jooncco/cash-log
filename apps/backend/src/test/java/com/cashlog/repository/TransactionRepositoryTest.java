package com.cashlog.repository;

import com.cashlog.entity.Category;
import com.cashlog.entity.Tag;
import com.cashlog.entity.Transaction;
import com.cashlog.entity.TransactionType;
import com.cashlog.specification.TransactionSpecifications;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class TransactionRepositoryTest {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private TagRepository tagRepository;

    private Category category(String name) {
        return categoryRepository.save(Category.builder().name(name).color("#3B82F6").build());
    }

    private Transaction tx(LocalDate date, TransactionType type, String amount, Category category) {
        BigDecimal value = new BigDecimal(amount);
        return Transaction.builder()
                .transactionDate(date)
                .transactionType(type)
                .originalAmount(value)
                .originalCurrency("KRW")
                .amountKrw(value)
                .category(category)
                .build();
    }

    @Test
    void findByTransactionDateBetween_Success() {
        Transaction transaction = Transaction.builder()
                .transactionDate(LocalDate.of(2024, 1, 15))
                .transactionType(TransactionType.EXPENSE)
                .originalAmount(new BigDecimal("10000"))
                .originalCurrency("KRW")
                .amountKrw(new BigDecimal("10000"))
                .category(category("Food"))
                .build();

        transactionRepository.save(transaction);

        LocalDate startDate = LocalDate.of(2024, 1, 1);
        LocalDate endDate = LocalDate.of(2024, 1, 31);

        List<Transaction> results = transactionRepository.findByTransactionDateBetweenOrderByTransactionDateDesc(startDate, endDate);

        assertFalse(results.isEmpty());
        assertEquals(1, results.size());
    }

    @Test
    void sumAmountByDateRangeAndType_Success() {
        Category category = category("Food");

        Transaction t1 = Transaction.builder()
                .transactionDate(LocalDate.of(2024, 1, 10))
                .transactionType(TransactionType.EXPENSE)
                .originalAmount(new BigDecimal("10000"))
                .originalCurrency("KRW")
                .amountKrw(new BigDecimal("10000"))
                .category(category)
                .build();

        Transaction t2 = Transaction.builder()
                .transactionDate(LocalDate.of(2024, 1, 20))
                .transactionType(TransactionType.EXPENSE)
                .originalAmount(new BigDecimal("20000"))
                .originalCurrency("KRW")
                .amountKrw(new BigDecimal("20000"))
                .category(category)
                .build();

        transactionRepository.save(t1);
        transactionRepository.save(t2);

        LocalDate startDate = LocalDate.of(2024, 1, 1);
        LocalDate endDate = LocalDate.of(2024, 1, 31);

        BigDecimal sum = transactionRepository.sumAmountByDateRangeAndType(
                startDate, endDate, TransactionType.EXPENSE);

        assertNotNull(sum);
        assertEquals(0, new BigDecimal("30000").compareTo(sum));
    }

    @Test
    void aggregateMonthlyTotals_groupsByYearMonthAndType() {
        Category category = category("Food");
        transactionRepository.saveAll(List.of(
                tx(LocalDate.of(2024, 1, 10), TransactionType.EXPENSE, "10000", category),
                tx(LocalDate.of(2024, 1, 20), TransactionType.EXPENSE, "20000", category),
                tx(LocalDate.of(2024, 1, 25), TransactionType.INCOME, "50000", category),
                tx(LocalDate.of(2024, 2, 3), TransactionType.INCOME, "70000", category),
                // Outside the queried range.
                tx(LocalDate.of(2024, 3, 3), TransactionType.INCOME, "90000", category)
        ));

        List<Object[]> rows = transactionRepository.aggregateMonthlyTotals(
                LocalDate.of(2024, 1, 1), LocalDate.of(2024, 2, 29));

        assertEquals(3, rows.size());
        Object[] januaryExpense = rows.stream()
                .filter(r -> ((Number) r[1]).intValue() == 1 && r[2] == TransactionType.EXPENSE)
                .findFirst().orElseThrow();
        assertEquals(2024, ((Number) januaryExpense[0]).intValue());
        assertEquals(0, new BigDecimal("30000").compareTo((BigDecimal) januaryExpense[3]));
    }

    @Test
    void aggregateTotalsBefore_onlyCountsEarlierTransactions() {
        Category category = category("Food");
        transactionRepository.saveAll(List.of(
                tx(LocalDate.of(2023, 12, 31), TransactionType.INCOME, "500000", category),
                tx(LocalDate.of(2023, 12, 31), TransactionType.EXPENSE, "200000", category),
                // On the boundary date, so excluded.
                tx(LocalDate.of(2024, 1, 1), TransactionType.INCOME, "999999", category)
        ));

        List<Object[]> rows = transactionRepository.aggregateTotalsBefore(LocalDate.of(2024, 1, 1));

        assertEquals(2, rows.size());
        BigDecimal income = rows.stream()
                .filter(r -> r[0] == TransactionType.INCOME)
                .map(r -> (BigDecimal) r[1]).findFirst().orElseThrow();
        assertEquals(0, new BigDecimal("500000").compareTo(income));
    }

    @Test
    void findEarliestAndLatestTransactionDate_returnFullRecordedRange() {
        Category category = category("Food");
        transactionRepository.saveAll(List.of(
                tx(LocalDate.of(2023, 5, 4), TransactionType.EXPENSE, "1000", category),
                tx(LocalDate.of(2024, 7, 9), TransactionType.INCOME, "2000", category)
        ));

        assertEquals(LocalDate.of(2023, 5, 4), transactionRepository.findEarliestTransactionDate());
        assertEquals(LocalDate.of(2024, 7, 9), transactionRepository.findLatestTransactionDate());
    }

    @Test
    void findAllWithSpecification_filtersByTypeCategoryAndTag_atDbLevel() {
        Category food = category("Food");
        Category transport = category("Transport");
        Tag lunchTag = tagRepository.save(Tag.builder().name("lunch").color("#111111").build());

        Transaction foodExpenseWithTag = Transaction.builder()
                .transactionDate(LocalDate.of(2024, 2, 5))
                .transactionType(TransactionType.EXPENSE)
                .originalAmount(new BigDecimal("10000"))
                .originalCurrency("KRW")
                .amountKrw(new BigDecimal("10000"))
                .category(food)
                .tags(new HashSet<>(Set.of(lunchTag)))
                .build();

        Transaction foodExpenseNoTag = Transaction.builder()
                .transactionDate(LocalDate.of(2024, 2, 8))
                .transactionType(TransactionType.EXPENSE)
                .originalAmount(new BigDecimal("5000"))
                .originalCurrency("KRW")
                .amountKrw(new BigDecimal("5000"))
                .category(food)
                .build();

        Transaction transportIncome = Transaction.builder()
                .transactionDate(LocalDate.of(2024, 2, 10))
                .transactionType(TransactionType.INCOME)
                .originalAmount(new BigDecimal("20000"))
                .originalCurrency("KRW")
                .amountKrw(new BigDecimal("20000"))
                .category(transport)
                .build();

        transactionRepository.save(foodExpenseWithTag);
        transactionRepository.save(foodExpenseNoTag);
        transactionRepository.save(transportIncome);

        Specification<Transaction> expenseInFood = TransactionSpecifications.withFilters(
                LocalDate.of(2024, 2, 1), LocalDate.of(2024, 2, 28),
                TransactionType.EXPENSE, List.of(food.getId()), null);

        Page<Transaction> expensePage = transactionRepository.findAll(expenseInFood, PageRequest.of(0, 20));
        assertEquals(2, expensePage.getTotalElements());

        Specification<Transaction> withTag = TransactionSpecifications.withFilters(
                null, null, null, null, List.of(lunchTag.getId()));

        Page<Transaction> taggedPage = transactionRepository.findAll(withTag, PageRequest.of(0, 20));
        assertEquals(1, taggedPage.getTotalElements());
        assertEquals(foodExpenseWithTag.getId(), taggedPage.getContent().get(0).getId());

        // No filters at all should behave like an unfiltered query.
        Page<Transaction> all = transactionRepository.findAll(TransactionSpecifications.withFilters(null, null, null, null, null), PageRequest.of(0, 20));
        assertEquals(3, all.getTotalElements());
    }
}
