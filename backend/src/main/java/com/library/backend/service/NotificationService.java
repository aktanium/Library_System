package com.library.backend.service;

import com.library.backend.dto.response.NotificationResponse;
import com.library.backend.entity.Notification;
import com.library.backend.exception.ResourceNotFoundException;
import com.library.backend.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications(String email) {
        return notificationRepository.findByUserEmailOrderByCreatedAtDesc(email).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(String email) {
        return notificationRepository.countByUserEmailAndReadFalse(email);
    }

    @Transactional
    public NotificationResponse markRead(Long id, String email) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));
        if (!n.getUser().getEmail().equals(email)) {
            throw new AccessDeniedException("Cannot modify another user's notification");
        }
        if (!n.isRead()) {
            n.setRead(true);
            notificationRepository.save(n);
        }
        return toResponse(n);
    }

    @Transactional
    public int markAllRead(String email) {
        return notificationRepository.markAllReadForUser(email);
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType())
                .read(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
