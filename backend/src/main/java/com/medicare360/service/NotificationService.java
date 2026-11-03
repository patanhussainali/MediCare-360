package com.medicare360.service;

import com.medicare360.dto.NotificationResponse;
import com.medicare360.entity.Notification;
import com.medicare360.exception.ResourceNotFoundException;
import com.medicare360.repository.NotificationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public List<NotificationResponse> getUserNotifications(String userId, int skip, int limit) {
        int page = limit > 0 ? skip / limit : 0;
        int size = limit > 0 ? limit : 20;
        Pageable pageable = PageRequest.of(page, size);
        Page<Notification> notifs = notificationRepository.findByUserIdOrUserIdIsNullOrderByCreatedAtDesc(userId, pageable);
        return notifs.getContent().stream().map(this::toResponse).toList();
    }

    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    public NotificationResponse markAsRead(String notifId, String userId) {
        Notification notification = notificationRepository.findById(notifId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (notification.getUserId() != null && !notification.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Notification not found");
        }

        notification.setRead(true);
        notification.setReadAt(Instant.now());
        notification = notificationRepository.save(notification);
        return toResponse(notification);
    }

    public Map<String, Object> markAllAsRead(String userId) {
        List<Notification> unread = notificationRepository.findAll().stream()
                .filter(n -> !n.isRead() && (n.getUserId() == null || n.getUserId().equals(userId)))
                .toList();

        Instant now = Instant.now();
        for (Notification n : unread) {
            n.setRead(true);
            n.setReadAt(now);
        }
        notificationRepository.saveAll(unread);
        return Map.of("message", "All notifications marked as read", "updated_count", unread.size());
    }

    public Notification createNotification(String userId, String title, String message, String type, String link) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type != null ? type : "INFO");
        notification.setLink(link);
        notification.setRead(false);
        return notificationRepository.save(notification);
    }

    public NotificationResponse toResponse(Notification n) {
        NotificationResponse res = new NotificationResponse();
        res.setId(n.getId());
        res.setTitle(n.getTitle());
        res.setMessage(n.getMessage());
        res.setType(n.getType());
        res.setRead(n.isRead());
        res.setLink(n.getLink());
        res.setReadAt(n.getReadAt());
        res.setCreatedAt(n.getCreatedAt());
        return res;
    }
}
