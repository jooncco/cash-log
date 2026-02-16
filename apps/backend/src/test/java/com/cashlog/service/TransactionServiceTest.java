package com.cashlog.service;

import com.cashlog.dto.request.CreateTransactionRequest;
import com.cashlog.dto.response.TransactionDTO;
import com.cashlog.entity.Transaction;
import com.cashlog.entity.TransactionType;
import com.cashlog.mapper.TransactionMapper;
import com.cashlog.repository.TagRepository;
import com.cashlog.repository.TransactionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;

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
        
        when(transactionRepository.save(any(Transaction.class))).thenReturn(transaction);
        when(transactionMapper.toDTO(any(Transaction.class))).thenReturn(new TransactionDTO());
        
        TransactionDTO result = transactionService.createTransaction(request);
        
        assertNotNull(result);
        verify(transactionRepository).save(any(Transaction.class));
    }
    
    @Test
    void createTransaction_WithUSD_Success() {
        CreateTransactionRequest request = CreateTransactionRequest.builder()
                .transactionDate(LocalDate.now())
                .transactionType(TransactionType.EXPENSE)
                .originalAmount(new BigDecimal("100"))
                .originalCurrency("USD")
                .conversionRate(new BigDecimal("1300"))
                .build();
        
        Transaction transaction = Transaction.builder()
                .id(1L)
                .amountKrw(new BigDecimal("130000"))
                .tags(new HashSet<>())
                .build();
        
        when(transactionRepository.save(any(Transaction.class))).thenReturn(transaction);
        when(transactionMapper.toDTO(any(Transaction.class))).thenReturn(new TransactionDTO());
        
        TransactionDTO result = transactionService.createTransaction(request);
        
        assertNotNull(result);
        verify(transactionRepository).save(any(Transaction.class));
    }
}
