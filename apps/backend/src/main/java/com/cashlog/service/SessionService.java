package com.cashlog.service;

import com.cashlog.dto.request.UpdateSessionRequest;
import com.cashlog.dto.response.SessionDTO;
import com.cashlog.entity.SessionPreferences;
import com.cashlog.entity.Theme;
import com.cashlog.repository.SessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SessionService {
    
    private final SessionRepository sessionRepository;
    
    public SessionDTO getOrCreateSession(String sessionKey) {
        SessionPreferences session = sessionRepository.findBySessionKey(sessionKey)
                .orElseGet(() -> createDefaultSession(sessionKey));
        return toDTO(session);
    }
    
    @Transactional
    public SessionDTO updateSession(String sessionKey, UpdateSessionRequest request) {
        SessionPreferences session = sessionRepository.findBySessionKey(sessionKey)
                .orElseGet(() -> createDefaultSession(sessionKey));
        
        if (request.getTheme() != null) {
            session.setTheme(request.getTheme());
        }
        if (request.getDefaultCurrency() != null) {
            session.setDefaultCurrency(request.getDefaultCurrency());
        }
        
        SessionPreferences updated = sessionRepository.save(session);
        return toDTO(updated);
    }
    
    private SessionPreferences createDefaultSession(String sessionKey) {
        SessionPreferences session = SessionPreferences.builder()
                .sessionKey(sessionKey)
                .theme(Theme.LIGHT)
                .defaultCurrency("KRW")
                .build();
        return sessionRepository.save(session);
    }
    
    private SessionDTO toDTO(SessionPreferences session) {
        return SessionDTO.builder()
                .id(session.getId())
                .sessionKey(session.getSessionKey())
                .theme(session.getTheme())
                .defaultCurrency(session.getDefaultCurrency())
                .createdAt(session.getCreatedAt())
                .updatedAt(session.getUpdatedAt())
                .build();
    }
}
