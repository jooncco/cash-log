package com.cashlog.dto.response;

import com.cashlog.entity.Theme;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SessionDTO {
    private Long id;
    private String sessionKey;
    private Theme theme;
    private String defaultCurrency;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
