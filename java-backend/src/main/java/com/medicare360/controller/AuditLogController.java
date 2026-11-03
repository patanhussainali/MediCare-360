package com.medicare360.controller;

import com.medicare360.dto.AuditLogResponse;
import com.medicare360.service.AuditService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/audit-logs")
@PreAuthorize("hasAuthority('ADMIN')")
public class AuditLogController {

    private final AuditService auditService;

    public AuditLogController(AuditService auditService) {
        this.auditService = auditService;
    }

    @GetMapping
    public ResponseEntity<List<AuditLogResponse>> listAuditLogs(
            @RequestParam(value = "skip", defaultValue = "0") int skip,
            @RequestParam(value = "limit", defaultValue = "100") int limit,
            @RequestParam(value = "action", required = false) String action,
            @RequestParam(value = "resource", required = false) String resource
    ) {
        return ResponseEntity.ok(auditService.getLogs(skip, limit, action, resource));
    }
}

