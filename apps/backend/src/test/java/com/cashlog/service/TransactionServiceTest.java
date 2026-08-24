package com.cashlog.service;

import com.cashlog.dto.request.CreateTransactionRequest;
import com.cashlog.dto.response.TransactionDTO;
import com.cashlog.entity.Category;
import com.cashlog.entity.Transaction;
import com.cashlog.entity.TransactionType;
import com.cashlog.mapper.TransactionMapper;
import com.cashlog.repository.CategoryRepository;
import com.cashlog.repository.TagRepository;
import com.cashlog.repository.TransactionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.ArgumentCaptor;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private TagRepository tagRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private TransactionMapper transactionMapper;

    @InjectMocks
    private TransactionService transactionService;

    @Test
    void createTransaction_WithKRW_Success() {
        CreateTransactionRequest request = CreateTransactionRequest.builder()
                .transactionDate(LocalDate.now())
                .transactionType(TransactionType.EXPENSE)
                .originalAmount(new BigDecimal("10000"))
                .originalCurrency("KRW")
                .categoryId(1L)
                .build();

        Transaction transaction = Transaction.builder()
                .id(1L)
                .transactionDate(request.getTransactionDate())
                .transactionType(request.getTransactionType())
                .originalAmount(request.getOriginalAmount())
                .originalCurrency(request.getOriginalCurrency())
                .amountKrw(request.getOriginalAmount())
                .tags(new HashSet<>())
                .build();

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(Category.builder().id(1L).name("Food").color("#ff0000").build()));
        when(transactionRepository.save(any(Transaction.class))).thenReturn(transaction);
        when(transactionMapper.toDTO(any(Transaction.class))).thenReturn(new TransactionDTO());

        TransactionDTO result = transactionService.createTransaction(request);

        assertNotNull(result);
        verify(transactionRepository).save(any(Transaction.class));
    }

    @Test
    void createTransaction_persistsFixedCostFlag_onExpense() {
        CreateTransactionRequest request = CreateTransactionRequest.builder()
                .transactionDate(LocalDate.now())
                .transactionType(TransactionType.EXPENSE)
                .originalAmount(new BigDecimal("10000"))
                .originalCurrency("KRW")
                .categoryId(1L)
                .fixedCost(true)
                .build();

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(Category.builder().id(1L).name("보험료").color("#ff0000").build()));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(inv -> inv.getArgument(0));
        when(transactionMapper.toDTO(any(Transaction.class))).thenReturn(new TransactionDTO());

        transactionService.createTransaction(request);

        ArgumentCaptor<Transaction> saved = ArgumentCaptor.forClass(Transaction.class);
        verify(transactionRepository).save(saved.capture());
        assertTrue(saved.getValue().getFixedCost());
    }

    @Test
    void createTransaction_forcesFixedCostFalse_onIncome() {
        CreateTransactionRequest request = CreateTransactionRequest.builder()
                .transactionDate(LocalDate.now())
                .transactionType(TransactionType.INCOME)
                .originalAmount(new BigDecimal("10000"))
                .originalCurrency("KRW")
                .categoryId(1L)
                // A client that sends the flag on income must not be able to
                // pollute the fixed-cost totals with money coming in.
                .fixedCost(true)
                .build();

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(Category.builder().id(1L).name("급여").color("#00ff00").build()));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(inv -> inv.getArgument(0));
        when(transactionMapper.toDTO(any(Transaction.class))).thenReturn(new TransactionDTO());

        transactionService.createTransaction(request);

        ArgumentCaptor<Transaction> saved = ArgumentCaptor.forClass(Transaction.class);
        verify(transactionRepository).save(saved.capture());
        assertFalse(saved.getValue().getFixedCost());
    }

    @Test
    void createTransaction_defaultsFixedCostToFalse_whenOmitted() {
        CreateTransactionRequest request = CreateTransactionRequest.builder()
                .transactionDate(LocalDate.now())
                .transactionType(TransactionType.EXPENSE)
                .originalAmount(new BigDecimal("10000"))
                .originalCurrency("KRW")
                .categoryId(1L)
                .build();

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(Category.builder().id(1L).name("Food").color("#ff0000").build()));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(inv -> inv.getArgument(0));
        when(transactionMapper.toDTO(any(Transaction.class))).thenReturn(new TransactionDTO());

        transactionService.createTransaction(request);

        ArgumentCaptor<Transaction> saved = ArgumentCaptor.forClass(Transaction.class);
        verify(transactionRepository).save(saved.capture());
        assertFalse(saved.getValue().getFixedCost());
    }

    @Test
    void createTransaction_WithUSD_Success() {
        CreateTransactionRequest request = CreateTransactionRequest.builder()
                .transactionDate(LocalDate.now())
                .transactionType(TransactionType.EXPENSE)
                .originalAmount(new BigDecimal("100"))
                .originalCurrency("USD")
                .conversionRate(new BigDecimal("1300"))
                .categoryId(1L)
                .build();

        Transaction transaction = Transaction.builder()
                .id(1L)
                .amountKrw(new BigDecimal("130000"))
                .tags(new HashSet<>())
                .build();

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(Category.builder().id(1L).name("Food").color("#ff0000").build()));
        when(transactionRepository.save(any(Transaction.class))).thenReturn(transaction);
        when(transactionMapper.toDTO(any(Transaction.class))).thenReturn(new TransactionDTO());

        TransactionDTO result = transactionService.createTransaction(request);

        assertNotNull(result);
        verify(transactionRepository).save(any(Transaction.class));
    }
}
