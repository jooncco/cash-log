package com.cashlog.service;

import com.cashlog.dto.request.CreateBudgetRequest;
import com.cashlog.dto.response.BudgetDTO;
import com.cashlog.entity.Budget;
import com.cashlog.entity.Category;
import com.cashlog.exception.ResourceNotFoundException;
import com.cashlog.mapper.BudgetMapper;
import com.cashlog.repository.BudgetRepository;
import com.cashlog.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BudgetService {
    
    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final BudgetMapper budgetMapper;
    
    @Transactional
    public BudgetDTO createBudget(CreateBudgetRequest request) {
        if (budgetRepository.existsByYearAndMonth(request.getYear(), request.getMonth())) {
            throw new IllegalArgumentException("Budget already exists for " + request.getYear() + "-" + request.getMonth());
        }
        
        Set<Category> categories = new HashSet<>();
        for (Long categoryId : request.getCategoryIds()) {
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + categoryId));
            categories.add(category);
        }
        
        Budget budget = Budget.builder()
                .year(request.getYear())
                .month(request.getMonth())
                .targetAmount(request.getTargetAmount())
                .categories(categories)
                .build();
        
        Budget saved = budgetRepository.save(budget);
        return budgetMapper.toDTO(saved);
    }
    
    public BudgetDTO getBudget(Integer year, Integer month) {
        Budget budget = budgetRepository.findByYearAndMonth(year, month)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found for " + year + "-" + month));
        return budgetMapper.toDTO(budget);
    }
    
    public java.util.List<BudgetDTO> getAllBudgets() {
        return budgetRepository.findAll().stream()
                .map(budgetMapper::toDTO)
                .collect(java.util.stream.Collectors.toList());
    }
    
    @Transactional
    public BudgetDTO updateBudget(Long id, CreateBudgetRequest request) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found: " + id));
        
        Set<Category> categories = new HashSet<>();
        for (Long categoryId : request.getCategoryIds()) {
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + categoryId));
            categories.add(category);
        }
        
        budget.setYear(request.getYear());
        budget.setMonth(request.getMonth());
        budget.setTargetAmount(request.getTargetAmount());
        budget.setCategories(categories);
        
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
