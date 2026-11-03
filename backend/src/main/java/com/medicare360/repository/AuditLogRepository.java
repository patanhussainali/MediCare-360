package com.medicare360.repository;

import com.medicare360.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditLogRepository extends MongoRepository<AuditLog, String> {

    Page<AuditLog> findByAction(String action, Pageable pageable);

    Page<AuditLog> findByResource(String resource, Pageable pageable);

    Page<AuditLog> findByActionAndResource(String action, String resource, Pageable pageable);
}
