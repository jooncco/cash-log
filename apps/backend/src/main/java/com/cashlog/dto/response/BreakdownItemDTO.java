package com.cashlog.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BreakdownItemDTO {
    private Long id;
    private String name;
    private String color;
    private BigDecimal amount;
    private Double percentage;
}
