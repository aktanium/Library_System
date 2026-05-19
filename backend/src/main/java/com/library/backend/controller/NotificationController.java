package com.library.backend.controller;

import com.library.backend.dto.response.NotificationResponse;
import com.library.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getMyNotifications() {
        String email = currentEmail();
        return ResponseEntity.ok(notificationService.getMyNotifications(email));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        String email = currentEmail();
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(email)));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markRead(@PathVariable Long id) {
        String email = currentEmail();
        return ResponseEntity.ok(notificationService.markRead(id, email));
    }

    @PutMapping("/read-all")
    public ResponseEntity<Map<String, Integer>> markAllRead() {
        String email = currentEmail();
        int updated = notificationService.markAllRead(email);
        return ResponseEntity.ok(Map.of("updated", updated));
    }

    private static String currentEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}
