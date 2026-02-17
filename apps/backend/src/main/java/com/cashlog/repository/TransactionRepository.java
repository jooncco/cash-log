package com.cashlog.repository;

import com.cashlog.entity.Transaction;
import com.cashlog.entity.TransactionType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    
    @EntityGraph(attributePaths = {"tags", "category"})
    List<Transaction> findAll();
    
    @EntityGraph(attributePaths = {"tags", "category"})
    Optional<Transaction> findById(Long id);
    
    @EntityGraph(attributePaths = {"tags", "category"})
    List<Transaction> findByTransactionDateBetween(LocalDate startDate, LocalDate endDate);
    
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
}
