package com.cashlog.mapper;

import com.cashlog.dto.response.BudgetDTO;
import com.cashlog.entity.Budget;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class BudgetMapper {
    
    private final CategoryMapper categoryMapper;
    
    public BudgetDTO toDTO(Budget budget) {
        return BudgetDTO.builder()
                .id(budget.getId())
                .year(budget.getYear())
                .month(budget.getMonth())
                .targetAmount(budget.getTargetAmount())
                .categories(budget.getCategories().stream()
                        .map(categoryMapper::toDTO)
                        .collect(Collectors.toSet()))
                .createdAt(budget.getCreatedAt())
                .updatedAt(budget.getUpdatedAt())
                .build();
    }
}
