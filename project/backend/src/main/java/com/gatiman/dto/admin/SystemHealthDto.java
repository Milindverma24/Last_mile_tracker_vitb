package com.gatiman.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemHealthDto {
    private String status; // UP, DEGRADED, DOWN
    private String applicationName;
    private String version;
    private Instant timestamp;
    private long uptimeSeconds;
    
    // Database Health
    private String databaseStatus; // CONNECTED, DISCONNECTED
    private String databaseEngine; // PostgreSQL, H2
    private int activeDbConnections;
    private int maxDbPoolSize;
    private long dbQueryLatencyMs;

    // JVM & Memory
    private long totalJvmMemoryMb;
    private long freeJvmMemoryMb;
    private long usedJvmMemoryMb;
    private double memoryUsagePercent;
    private int activeThreads;

    // Logistics Fleet State
    private int totalAgents;
    private int onlineAgents;
    private int activeOrdersInFlight;

    // Additional metrics
    private Map<String, Object> subsystemMetrics;
}
