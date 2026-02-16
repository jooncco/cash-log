package com.cashlog.service;

import com.cashlog.dto.request.CreateBudgetRequest;
import com.cashlog.dto.response.BudgetDTO;
import com.cashlog.entity.Budget;
import com.cashlog.mapper.BudgetMapper;
import com.cashlog.repository.BudgetRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BudgetServiceTest {
    
    @Mock
    private BudgetRepository budgetRepository;
    
    @Mock
    private BudgetMapper budgetMapper;
    
    @InjectMocks
    private BudgetService budgetService;
    
    @Test
    void createBudget_Success() {
        CreateBudgetRequest request = CreateBudgetRequest.builder()
                .year(2024)
                .month(1)
                .targetAmount(new BigDecimal("1000000"))
                .build();
        
        Budget budget = Budget.builder()
                .id(1L)
                .year(request.getYear())
                .month(request.getMonth())
                .targetAmount(request.getTargetAmount())
                .build();
        
        when(budgetRepository.existsByYearAndMonth(2024, 1)).thenReturn(false);
        when(budgetRepository.save(any(Budget.class))).thenReturn(budget);
        when(budgetMapper.toDTO(any(Budget.class))).thenReturn(new BudgetDTO());
        
        BudgetDTO result = budgetService.createBudget(request);
        
        assertNotNull(result);
        verify(budgetRepository).save(any(Budget.class));
    }
    
    @Test
    void createBudget_AlreadyExists_ThrowsException() {
        CreateBudgetRequest request = CreateBudgetRequest.builder()
                .year(2024)
                .month(1)
                .targetAmount(new BigDecimal("1000000"))
                .build();
        
        when(budgetRepository.existsByYearAndMonth(2024, 1)).thenReturn(true);
        
        assertThrows(IllegalArgumentException.class, () -> {
            budgetService.createBudget(request);
        });
    }
    
    @Test
    void getBudget_Success() {
        Budget budget = Budget.builder()
                .id(1L)
                .year(2024)
                .month(1)
                .targetAmount(new BigDecimal("1000000"))
                .build();
        
        when(budgetRepository.findByYearAndMonth(2024, 1)).thenReturn(Optional.of(budget));
        when(budgetMapper.toDTO(any(Budget.class))).thenReturn(new BudgetDTO());
        
        BudgetDTO result = budgetService.getBudget(2024, 1);
        
        assertNotNull(result);
    }
}
