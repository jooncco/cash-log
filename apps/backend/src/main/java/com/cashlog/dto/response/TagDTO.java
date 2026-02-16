package com.cashlog.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TagDTO {
    private Long id;
    private String name;
    private String color;
    private LocalDateTime createdAt;
}
