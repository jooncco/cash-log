package com.cashlog.repository;

import com.cashlog.entity.Transaction;
import com.cashlog.entity.TransactionType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long>, JpaSpecificationExecutor<Transaction> {
    
    @EntityGraph(attributePaths = {"tags", "category"})
    List<Transaction> findAllByOrderByTransactionDateDesc();
    
    @EntityGraph(attributePaths = {"tags", "category"})
    Optional<Transaction> findById(Long id);
    
    @EntityGraph(attributePaths = {"tags", "category"})
    List<Transaction> findByTransactionDateBetweenOrderByTransactionDateDesc(LocalDate startDate, LocalDate endDate);
    
    @EntityGraph(attributePaths = {"tags", "category"})
    List<Transaction> findByTransactionType(TransactionType type);
    
    @EntityGraph(attributePaths = {"tags", "category"})
    @Query("SELECT t FROM Transaction t WHERE t.transactionDate BETWEEN :startDate AND :endDate AND t.transactionType = :type")
    List<Transaction> findByDateRangeAndType(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate,
        @Param("type") TransactionType type
    );
    
    @Query("SELECT SUM(t.amountKrw) FROM Transaction t WHERE t.transactionDate BETWEEN :startDate AND :endDate AND t.transactionType = :type")
    BigDecimal sumAmountByDateRangeAndType(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate,
        @Param("type") TransactionType type
    );

    /**
     * Per-month income/expense totals aggregated in the database, used by the
     * monthly trend chart. Returns rows of
     * {@code [year, month, transactionType, sumAmountKrw]}.
     */
    @Query("SELECT YEAR(t.transactionDate), MONTH(t.transactionDate), t.transactionType, SUM(t.amountKrw) " +
           "FROM Transaction t WHERE t.transactionDate BETWEEN :startDate AND :endDate " +
           "GROUP BY YEAR(t.transactionDate), MONTH(t.transactionDate), t.transactionType " +
           "ORDER BY YEAR(t.transactionDate), MONTH(t.transactionDate)")
    List<Object[]> aggregateMonthlyTotals(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    /**
     * Income/expense totals for everything strictly before {@code date}, used
     * as the opening balance of the cumulative savings line. Returns rows of
     * {@code [transactionType, sumAmountKrw]}.
     */
    @Query("SELECT t.transactionType, SUM(t.amountKrw) FROM Transaction t " +
           "WHERE t.transactionDate < :date GROUP BY t.transactionType")
    List<Object[]> aggregateTotalsBefore(@Param("date") LocalDate date);

    /** Earliest recorded transaction date, or {@code null} when there is no data. */
    @Query("SELECT MIN(t.transactionDate) FROM Transaction t")
    LocalDate findEarliestTransactionDate();

    /** Latest recorded transaction date, or {@code null} when there is no data. */
    @Query("SELECT MAX(t.transactionDate) FROM Transaction t")
    LocalDate findLatestTransactionDate();
}
