package com.gatiman.service.impl;

import com.gatiman.dto.admin.AuditLogResponse;
import com.gatiman.entity.AuditLog;
import com.gatiman.repository.AuditLogRepository;
import com.gatiman.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditServiceImpl implements AuditService {

    private final AuditLogRepository auditLogRepository;

    @Override
    @Transactional
    public AuditLog logAction(String actor, String action, String entityType, Long entityId, String description) {
        return logAction(actor, "SYSTEM", action, entityType, entityId, description);
    }

    @Override
    @Transactional
    public AuditLog logAction(String actor, String role, String action, String entityType, Long entityId, String description) {
        AuditLog log = AuditLog.builder()
                .actor(actor)
                .role(role)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .description(description)
                .timestamp(Instant.now())
                .build();
        return auditLogRepository.save(log);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLog> getLogsForEntity(String entityType, Long entityId) {
        return auditLogRepository.findByEntityTypeAndEntityIdOrderByTimestampDesc(entityType, entityId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AuditLogResponse> getAuditLogs(Pageable pageable) {
        return auditLogRepository.findAllByOrderByTimestampDesc(pageable)
                .map(a -> AuditLogResponse.builder()
                        .id(a.getId())
                        .actor(a.getActor())
                        .role(a.getRole())
                        .action(a.getAction())
                        .entityType(a.getEntityType())
                        .entityId(a.getEntityId())
                        .description(a.getDescription())
                        .timestamp(a.getTimestamp())
                        .build());
    }
}
