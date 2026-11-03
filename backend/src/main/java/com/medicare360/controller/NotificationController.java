package com.medicare360.controller;

import com.medicare360.dto.NotificationResponse;
import com.medicare360.security.UserPrincipal;
import com.medicare360.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@PreAuthorize("isAuthenticated()")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getMyNotifications(
            @RequestParam(value = "skip", defaultValue = "0") int skip,
            @RequestParam(value = "limit", defaultValue = "50") int limit,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(notificationService.getUserNotifications(principal.getUserId(), skip, limit));
    }

    // Must be declared BEFORE /{id}/read so 'read-all' is not parsed as String
    @PatchMapping("/read-all")
    public ResponseEntity<Map<String, Object>> markAllNotificationsRead(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(notificationService.markAllAsRead(principal.getUserId()));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markNotificationRead(
            @PathVariable("id") String id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(notificationService.markAsRead(id, principal.getUserId()));
    }
}

