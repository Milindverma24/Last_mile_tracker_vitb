package com.gatiman.service;

import com.gatiman.dto.admin.AuditLogResponse;
import com.gatiman.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface AuditService {
    AuditLog logAction(String actor, String action, String entityType, Long entityId, String description);
    AuditLog logAction(String actor, String role, String action, String entityType, Long entityId, String description);
    List<AuditLog> getLogsForEntity(String entityType, Long entityId);
    Page<AuditLogResponse> getAuditLogs(Pageable pageable);
}
