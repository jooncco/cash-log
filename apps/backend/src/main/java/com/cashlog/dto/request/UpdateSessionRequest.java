package com.cashlog.dto.request;

import com.cashlog.entity.Theme;
import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateSessionRequest {
    
    private Theme theme;
    
    @Size(min = 3, max = 3, message = "Currency must be 3 characters")
    private String defaultCurrency;
}
