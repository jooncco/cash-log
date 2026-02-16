package com.cashlog.repository;

import com.cashlog.entity.SessionPreferences;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SessionRepository extends JpaRepository<SessionPreferences, Long> {
    
    Optional<SessionPreferences> findBySessionKey(String sessionKey);
}
