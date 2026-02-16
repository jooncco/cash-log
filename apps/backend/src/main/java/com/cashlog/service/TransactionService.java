package com.cashlog.service;

import com.cashlog.dto.request.CreateTransactionRequest;
import com.cashlog.dto.response.TransactionDTO;
import com.cashlog.entity.Tag;
import com.cashlog.entity.Transaction;
import com.cashlog.entity.TransactionType;
import com.cashlog.exception.ResourceNotFoundException;
import com.cashlog.mapper.TransactionMapper;
import com.cashlog.repository.TagRepository;
import com.cashlog.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TransactionService {
    
    private final TransactionRepository transactionRepository;
    private final TagRepository tagRepository;
    private final TransactionMapper transactionMapper;
    
    @Transactional
    public TransactionDTO createTransaction(CreateTransactionRequest request) {
        BigDecimal amountKrw = calculateAmountKrw(request.getOriginalAmount(), 
                request.getOriginalCurrency(), request.getConversionRate());
        
        Set<Tag> tags = new HashSet<>();
        if (request.getTagIds() != null) {
            tags = request.getTagIds().stream()
                    .map(id -> tagRepository.findById(id)
                            .orElseThrow(() -> new ResourceNotFoundException("Tag not found: " + id)))
                    .collect(Collectors.toSet());
        }
        
        Transaction transaction = Transaction.builder()
                .transactionDate(request.getTransactionDate())
                .transactionType(request.getTransactionType())
                .originalAmount(request.getOriginalAmount())
                .originalCurrency(request.getOriginalCurrency())
                .conversionRate(request.getConversionRate())
                .amountKrw(amountKrw)
                .memo(request.getMemo())
                .tags(tags)
                .build();
        
        Transaction saved = transactionRepository.save(transaction);
        return transactionMapper.toDTO(saved);
    }
    
    public TransactionDTO getTransaction(Long id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found: " + id));
        return transactionMapper.toDTO(transaction);
    }
    
    public List<TransactionDTO> getAllTransactions() {
        return transactionRepository.findAll().stream()
                .map(transactionMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    public List<TransactionDTO> getTransactionsByDateRange(LocalDate startDate, LocalDate endDate) {
        return transactionRepository.findByTransactionDateBetween(startDate, endDate).stream()
                .map(transactionMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public TransactionDTO updateTransaction(Long id, CreateTransactionRequest request) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found: " + id));
        
        BigDecimal amountKrw = calculateAmountKrw(request.getOriginalAmount(), 
                request.getOriginalCurrency(), request.getConversionRate());
        
        Set<Tag> tags = new HashSet<>();
        if (request.getTagIds() != null) {
            tags = request.getTagIds().stream()
                    .map(tagId -> tagRepository.findById(tagId)
                            .orElseThrow(() -> new ResourceNotFoundException("Tag not found: " + tagId)))
                    .collect(Collectors.toSet());
        }
        
        transaction.setTransactionDate(request.getTransactionDate());
        transaction.setTransactionType(request.getTransactionType());
        transaction.setOriginalAmount(request.getOriginalAmount());
        transaction.setOriginalCurrency(request.getOriginalCurrency());
        transaction.setConversionRate(request.getConversionRate());
        transaction.setAmountKrw(amountKrw);
        transaction.setMemo(request.getMemo());
        transaction.setTags(tags);
        
        Transaction updated = transactionRepository.save(transaction);
        return transactionMapper.toDTO(updated);
    }

    @Transactional
    public void deleteTransaction(Long id) {
        if (!transactionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Transaction not found: " + id);
        }
        transactionRepository.deleteById(id);
    }
    
    private BigDecimal calculateAmountKrw(BigDecimal originalAmount, String currency, BigDecimal conversionRate) {
        if ("KRW".equals(currency)) {
            return originalAmount;
        }
        if (conversionRate == null) {
            throw new IllegalArgumentException("Conversion rate required for non-KRW currency");
        }
        return originalAmount.multiply(conversionRate);
    }
}
