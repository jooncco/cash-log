package com.cashlog.mapper;

import com.cashlog.dto.response.BudgetDTO;
import com.cashlog.entity.Budget;
import org.springframework.stereotype.Component;

@Component
public class BudgetMapper {
    
    public BudgetDTO toDTO(Budget budget) {
        return BudgetDTO.builder()
                .id(budget.getId())
                .year(budget.getYear())
                .month(budget.getMonth())
                .targetAmount(budget.getTargetAmount())
                .createdAt(budget.getCreatedAt())
                .updatedAt(budget.getUpdatedAt())
                .build();
    }
}
