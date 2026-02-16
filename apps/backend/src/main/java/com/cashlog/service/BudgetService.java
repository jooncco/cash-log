package com.cashlog.service;

import com.cashlog.dto.request.CreateBudgetRequest;
import com.cashlog.dto.response.BudgetDTO;
import com.cashlog.entity.Budget;
import com.cashlog.exception.ResourceNotFoundException;
import com.cashlog.mapper.BudgetMapper;
import com.cashlog.repository.BudgetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BudgetService {
    
    private final BudgetRepository budgetRepository;
    private final BudgetMapper budgetMapper;
    
    @Transactional
    public BudgetDTO createBudget(CreateBudgetRequest request) {
        if (budgetRepository.existsByYearAndMonth(request.getYear(), request.getMonth())) {
            throw new IllegalArgumentException("Budget already exists for " + request.getYear() + "-" + request.getMonth());
        }
        
        Budget budget = Budget.builder()
                .year(request.getYear())
                .month(request.getMonth())
                .targetAmount(request.getTargetAmount())
                .build();
        
        Budget saved = budgetRepository.save(budget);
        return budgetMapper.toDTO(saved);
    }
    
    public BudgetDTO getBudget(Integer year, Integer month) {
        Budget budget = budgetRepository.findByYearAndMonth(year, month)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found for " + year + "-" + month));
        return budgetMapper.toDTO(budget);
    }
    
    @Transactional
    public BudgetDTO updateBudget(Long id, CreateBudgetRequest request) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found: " + id));
        
        budget.setYear(request.getYear());
        budget.setMonth(request.getMonth());
        budget.setTargetAmount(request.getTargetAmount());
        
        Budget updated = budgetRepository.save(budget);
        return budgetMapper.toDTO(updated);
    }
    
    @Transactional
    public void deleteBudget(Long id) {
        if (!budgetRepository.existsById(id)) {
            throw new ResourceNotFoundException("Budget not found: " + id);
        }
        budgetRepository.deleteById(id);
    }
}
