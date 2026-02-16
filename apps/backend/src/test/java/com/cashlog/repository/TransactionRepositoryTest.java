package com.cashlog.repository;

import com.cashlog.entity.Transaction;
import com.cashlog.entity.TransactionType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class TransactionRepositoryTest {
    
    @Autowired
    private TransactionRepository transactionRepository;
    
    @Test
    void findByTransactionDateBetween_Success() {
        Transaction transaction = Transaction.builder()
                .transactionDate(LocalDate.of(2024, 1, 15))
                .transactionType(TransactionType.EXPENSE)
                .originalAmount(new BigDecimal("10000"))
                .originalCurrency("KRW")
                .amountKrw(new BigDecimal("10000"))
                .build();
        
        transactionRepository.save(transaction);
        
        LocalDate startDate = LocalDate.of(2024, 1, 1);
        LocalDate endDate = LocalDate.of(2024, 1, 31);
        
        List<Transaction> results = transactionRepository.findByTransactionDateBetween(startDate, endDate);
        
        assertFalse(results.isEmpty());
        assertEquals(1, results.size());
    }
    
    @Test
    void sumAmountByDateRangeAndType_Success() {
        Transaction t1 = Transaction.builder()
                .transactionDate(LocalDate.of(2024, 1, 10))
                .transactionType(TransactionType.EXPENSE)
                .originalAmount(new BigDecimal("10000"))
                .originalCurrency("KRW")
                .amountKrw(new BigDecimal("10000"))
                .build();
        
        Transaction t2 = Transaction.builder()
                .transactionDate(LocalDate.of(2024, 1, 20))
                .transactionType(TransactionType.EXPENSE)
                .originalAmount(new BigDecimal("20000"))
                .originalCurrency("KRW")
                .amountKrw(new BigDecimal("20000"))
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
}
