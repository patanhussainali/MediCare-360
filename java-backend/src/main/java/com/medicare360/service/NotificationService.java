package com.medicare360.service;

import com.medicare360.dto.NotificationResponse;
import com.medicare360.entity.Notification;
import com.medicare360.entity.User;
import com.medicare360.exception.ResourceNotFoundException;
import com.medicare360.repository.NotificationRepository;
import com.medicare360.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getUserNotifications(Long userId, int skip, int limit) {
        int page = limit > 0 ? skip / limit : 0;
        int size = limit > 0 ? limit : 20;
        Pageable pageable = PageRequest.of(page, size);

        Page<Notification> notifs = notificationRepository.findByUser_IdOrUserIsNullOrderByCreatedAtDesc(userId, pageable);
        return notifs.getContent().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUser_IdAndIsReadFalse(userId);
    }

    @Transactional
    public NotificationResponse markAsRead(Long notifId, Long userId) {
        Notification notification = notificationRepository.findById(notifId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (notification.getUser() != null && !notification.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Notification not found");
        }

        notification.setRead(true);
        notification.setReadAt(Instant.now());
        notification = notificationRepository.save(notification);
        return toResponse(notification);
    }

    @Transactional
    public Map<String, Object> markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findAll().stream()
                .filter(n -> !n.isRead() && (n.getUser() == null || n.getUser().getId().equals(userId)))
                .toList();

        Instant now = Instant.now();
        for (Notification n : unread) {
            n.setRead(true);
            n.setReadAt(now);
        }
        notificationRepository.saveAll(unread);

        return Map.of("message", "All notifications marked as read", "updated_count", unread.size());
    }

    @Transactional
    public Notification createNotification(Long userId, String title, String message, String type, String link) {
        Notification notification = new Notification();
        if (userId != null) {
            User user = userRepository.findById(userId).orElse(null);
            notification.setUser(user);
        }
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

