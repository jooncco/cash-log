package com.cashlog.controller;

import com.cashlog.dto.request.CreateTransactionRequest;
import com.cashlog.dto.response.PageResponseDTO;
import com.cashlog.dto.response.TransactionDTO;
import com.cashlog.entity.TransactionType;
import com.cashlog.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@Tag(name = "Transaction", description = "Transaction management APIs")
public class TransactionController {
    
    private final TransactionService transactionService;
    
    @PostMapping
    @Operation(summary = "Create a new transaction")
    public ResponseEntity<TransactionDTO> createTransaction(@Valid @RequestBody CreateTransactionRequest request) {
        TransactionDTO created = transactionService.createTransaction(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get transaction by ID")
    public ResponseEntity<TransactionDTO> getTransaction(@PathVariable Long id) {
        TransactionDTO transaction = transactionService.getTransaction(id);
        return ResponseEntity.ok(transaction);
    }
    
    @GetMapping
    @Operation(summary = "Get transactions with optional filters, paginated")
    public ResponseEntity<PageResponseDTO<TransactionDTO>> getTransactions(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) List<Long> categoryId,
            @RequestParam(required = false) List<Long> tagId,
            @PageableDefault(size = 20, sort = "transactionDate", direction = Sort.Direction.DESC) Pageable pageable) {

        TransactionType transactionType = type != null ? TransactionType.valueOf(type) : null;

        Page<TransactionDTO> transactions = transactionService.getTransactions(
                startDate, endDate, transactionType, categoryId, tagId, pageable);

        return ResponseEntity.ok(PageResponseDTO.of(transactions));
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update transaction by ID")
    public ResponseEntity<TransactionDTO> updateTransaction(
            @PathVariable Long id,
            @Valid @RequestBody CreateTransactionRequest request) {
        TransactionDTO updated = transactionService.updateTransaction(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete transaction by ID")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.noContent().build();
    }
}
