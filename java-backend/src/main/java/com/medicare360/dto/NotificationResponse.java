package com.medicare360.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
public class NotificationResponse {

    private Long id;

    private Long userId;

    private String title;

    private String message;

    private String type;

    @JsonProperty("is_read")
    private boolean isRead;

    private String link;

    private Instant readAt;

    private Instant createdAt;
}
