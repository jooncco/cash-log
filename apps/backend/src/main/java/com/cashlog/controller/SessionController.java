package com.cashlog.controller;

import com.cashlog.dto.request.UpdateSessionRequest;
import com.cashlog.dto.response.SessionDTO;
import com.cashlog.service.SessionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/session")
@RequiredArgsConstructor
@Tag(name = "Session", description = "Session preferences APIs")
public class SessionController {
    
    private final SessionService sessionService;
    
    @GetMapping("/{sessionKey}")
    @Operation(summary = "Get or create session preferences")
    public ResponseEntity<SessionDTO> getSession(@PathVariable String sessionKey) {
        SessionDTO session = sessionService.getOrCreateSession(sessionKey);
        return ResponseEntity.ok(session);
    }
    
    @PutMapping("/{sessionKey}")
    @Operation(summary = "Update session preferences")
    public ResponseEntity<SessionDTO> updateSession(
            @PathVariable String sessionKey,
            @Valid @RequestBody UpdateSessionRequest request) {
        SessionDTO updated = sessionService.updateSession(sessionKey, request);
        return ResponseEntity.ok(updated);
    }
}
