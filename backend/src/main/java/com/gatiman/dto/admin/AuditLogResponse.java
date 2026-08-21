package com.gatiman.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogResponse {
    private Long id;
    private String actor;
    private String role;
    private String action;
    private String entityType;
    private Long entityId;
    private String description;
    private Instant timestamp;
}
