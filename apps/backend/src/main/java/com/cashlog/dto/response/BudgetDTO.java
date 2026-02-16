package com.cashlog.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetDTO {
    private Long id;
    private Integer year;
    private Integer month;
    private BigDecimal targetAmount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
