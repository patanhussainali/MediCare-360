package com.medicare360.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medicare360.dto.AuditLogResponse;
import com.medicare360.entity.AuditLog;
import com.medicare360.entity.User;
import com.medicare360.repository.AuditLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    public AuditService(AuditLogRepository auditLogRepository, ObjectMapper objectMapper) {
        this.auditLogRepository = auditLogRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public void logAction(String action, String resource, User user, String resourceId, Object details, String ipAddress, String userAgent) {
        AuditLog log = new AuditLog();
        log.setAction(action);
        log.setResource(resource);
        log.setResourceId(resourceId);
        log.setIpAddress(ipAddress);
        log.setUserAgent(userAgent);

        if (user != null) {
            log.setUser(user);
            log.setUserEmail(user.getEmail());
            log.setUserName(user.getFullName());
        } else {
            log.setUserName("System");
        }

        if (details != null) {
            if (details instanceof String) {
                log.setDetails((String) details);
            } else {
                try {
                    log.setDetails(objectMapper.writeValueAsString(details));
                } catch (Exception e) {
                    log.setDetails(details.toString());
                }
            }
        }

        auditLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public List<AuditLogResponse> getLogs(int skip, int limit, String action, String resource) {
        int page = limit > 0 ? skip / limit : 0;
        int size = limit > 0 ? limit : 50;
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Specification<AuditLog> spec = (root, query, cb) -> {
            var predicates = new java.util.ArrayList<jakarta.persistence.criteria.Predicate>();
            if (action != null && !action.isBlank()) {
                predicates.add(cb.equal(root.get("action"), action));
            }
            if (resource != null && !resource.isBlank()) {
                predicates.add(cb.equal(root.get("resource"), resource));
            }
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        Page<AuditLog> logs = auditLogRepository.findAll(spec, pageable);
        return logs.getContent().stream().map(this::toResponse).toList();
    }

    private AuditLogResponse toResponse(AuditLog log) {
        AuditLogResponse res = new AuditLogResponse();
        res.setId(log.getId());
        if (log.getUser() != null) {
            res.setUserId(log.getUser().getId());
        }
        res.setUserEmail(log.getUserEmail());
        res.setUserName(log.getUserName());
        res.setAction(log.getAction());
        res.setResource(log.getResource());
        res.setResourceId(log.getResourceId());
        res.setIpAddress(log.getIpAddress());
        res.setUserAgent(log.getUserAgent());
        res.setCreatedAt(log.getCreatedAt());

        if (log.getDetails() != null) {
            try {
                res.setDetails(objectMapper.readValue(log.getDetails(), Map.class));
            } catch (Exception e) {
                res.setDetails(log.getDetails());
            }
        }
        return res;
    }
}

