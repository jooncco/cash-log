package com.cashlog.controller;

import com.cashlog.dto.request.CreateBudgetRequest;
import com.cashlog.dto.response.BudgetDTO;
import com.cashlog.service.BudgetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
@Tag(name = "Budget", description = "Budget management APIs")
public class BudgetController {
    
    private final BudgetService budgetService;
    
    @PostMapping
    @Operation(summary = "Create a new budget")
    public ResponseEntity<BudgetDTO> createBudget(@Valid @RequestBody CreateBudgetRequest request) {
        BudgetDTO created = budgetService.createBudget(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @GetMapping("/{year}/{month}")
    @Operation(summary = "Get budget by year and month")
    public ResponseEntity<BudgetDTO> getBudget(@PathVariable Integer year, @PathVariable Integer month) {
        BudgetDTO budget = budgetService.getBudget(year, month);
        return ResponseEntity.ok(budget);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update budget")
    public ResponseEntity<BudgetDTO> updateBudget(@PathVariable Long id, @Valid @RequestBody CreateBudgetRequest request) {
        BudgetDTO updated = budgetService.updateBudget(id, request);
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete budget")
    public ResponseEntity<Void> deleteBudget(@PathVariable Long id) {
        budgetService.deleteBudget(id);
        return ResponseEntity.noContent().build();
    }
}
