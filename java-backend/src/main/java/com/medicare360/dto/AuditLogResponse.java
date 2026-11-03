package com.medicare360.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
public class AuditLogResponse {

    private Long id;

    private Long userId;

    private String userEmail;

    private String userName;

    private String action;

    private String resource;

    private String resourceId;

    private Object details;

    private String ipAddress;

    private String userAgent;

    private Instant createdAt;
}

