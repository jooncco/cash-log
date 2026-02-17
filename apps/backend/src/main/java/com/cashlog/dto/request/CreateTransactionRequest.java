package com.cashlog.dto.request;

import com.cashlog.entity.TransactionType;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateTransactionRequest {
    
    @NotNull(message = "Transaction date is required")
    private LocalDate transactionDate;
    
    @NotNull(message = "Transaction type is required")
    private TransactionType transactionType;
    
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal originalAmount;
    
    @NotBlank(message = "Currency is required")
    @Size(min = 3, max = 3, message = "Currency must be 3 characters")
    private String originalCurrency;
    
    @DecimalMin(value = "0.01", message = "Conversion rate must be at least 0.01")
    @DecimalMax(value = "10000", message = "Conversion rate must not exceed 10000")
    private BigDecimal conversionRate;
    
    @NotNull(message = "Category is required")
    private Long categoryId;
    
    private String memo;
    
    private Set<String> tagNames;
}
