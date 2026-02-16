package com.cashlog.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "session_preferences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SessionPreferences {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "session_key", nullable = false, unique = true, length = 100)
    private String sessionKey;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "theme", length = 10)
    @Builder.Default
    private Theme theme = Theme.LIGHT;
    
    @Column(name = "default_currency", length = 3)
    @Builder.Default
    private String defaultCurrency = "KRW";
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
