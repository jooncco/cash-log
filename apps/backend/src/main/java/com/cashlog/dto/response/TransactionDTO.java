package com.cashlog.dto.response;

import com.cashlog.entity.TransactionType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionDTO {
    private Long id;
    private LocalDate transactionDate;
    private TransactionType transactionType;
    private BigDecimal originalAmount;
    private String originalCurrency;
    private BigDecimal conversionRate;
    private BigDecimal amountKrw;
    private String memo;
    private Set<TagDTO> tags;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
