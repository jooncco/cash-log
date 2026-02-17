package com.cashlog.mapper;

import com.cashlog.dto.response.CategoryDTO;
import com.cashlog.dto.response.TagDTO;
import com.cashlog.dto.response.TransactionDTO;
import com.cashlog.entity.Category;
import com.cashlog.entity.Transaction;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class TransactionMapper {
    
    public TransactionDTO toDTO(Transaction transaction) {
        CategoryDTO categoryDTO = null;
        if (transaction.getCategory() != null) {
            Category category = transaction.getCategory();
            categoryDTO = CategoryDTO.builder()
                    .id(category.getId())
                    .name(category.getName())
                    .color(category.getColor())
                    .createdAt(category.getCreatedAt())
                    .updatedAt(category.getUpdatedAt())
                    .build();
        }
        
        return TransactionDTO.builder()
                .id(transaction.getId())
                .transactionDate(transaction.getTransactionDate())
                .transactionType(transaction.getTransactionType())
                .originalAmount(transaction.getOriginalAmount())
                .originalCurrency(transaction.getOriginalCurrency())
                .conversionRate(transaction.getConversionRate())
                .amountKrw(transaction.getAmountKrw())
                .category(categoryDTO)
                .memo(transaction.getMemo())
                .tags(transaction.getTags().stream()
                        .map(tag -> TagDTO.builder()
                                .id(tag.getId())
                                .name(tag.getName())
                                .color(tag.getColor())
                                .createdAt(tag.getCreatedAt())
                                .build())
                        .collect(Collectors.toSet()))
                .createdAt(transaction.getCreatedAt())
                .updatedAt(transaction.getUpdatedAt())
                .build();
    }
}
