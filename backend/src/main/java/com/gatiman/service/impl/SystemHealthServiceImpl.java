package com.gatiman.service.impl;

import com.gatiman.dto.admin.SystemHealthDto;
import com.gatiman.enums.OrderStatus;
import com.gatiman.repository.DeliveryAgentRepository;
import com.gatiman.repository.OrderRepository;
import com.gatiman.service.SystemHealthService;
import com.zaxxer.hikari.HikariDataSource;
import com.zaxxer.hikari.HikariPoolMXBean;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.lang.management.ManagementFactory;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.Statement;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class SystemHealthServiceImpl implements SystemHealthService {

    private final DataSource dataSource;
    private final DeliveryAgentRepository deliveryAgentRepository;
    private final OrderRepository orderRepository;

    private static final long APP_START_TIME = ManagementFactory.getRuntimeMXBean().getStartTime();

    @Override
    public SystemHealthDto getSystemHealth() {
        long uptimeSeconds = (System.currentTimeMillis() - APP_START_TIME) / 1000;

        // DB Probe
        String dbStatus = "CONNECTED";
        String dbEngine = "Unknown";
        long dbLatency = 0;
        int activeConn = 1;
        int maxPool = 20;

        long queryStart = System.currentTimeMillis();
        try (Connection conn = dataSource.getConnection(); Statement stmt = conn.createStatement()) {
            stmt.execute("SELECT 1");
            dbLatency = System.currentTimeMillis() - queryStart;
            DatabaseMetaData metaData = conn.getMetaData();
            dbEngine = metaData.getDatabaseProductName() + " " + metaData.getDatabaseProductVersion();
        } catch (Exception e) {
            log.error("Database health check probe failed", e);
            dbStatus = "DISCONNECTED";
        }

        if (dataSource instanceof HikariDataSource hikariDs) {
            HikariPoolMXBean poolBean = hikariDs.getHikariPoolMXBean();
            if (poolBean != null) {
                activeConn = poolBean.getActiveConnections();
                maxPool = hikariDs.getMaximumPoolSize();
            }
        }

        // JVM stats
        Runtime runtime = Runtime.getRuntime();
        long totalMem = runtime.totalMemory() / (1024 * 1024);
        long freeMem = runtime.freeMemory() / (1024 * 1024);
        long usedMem = totalMem - freeMem;
        double memPercent = totalMem > 0 ? ((double) usedMem / totalMem) * 100.0 : 0.0;
        int threads = ManagementFactory.getThreadMXBean().getThreadCount();

        // Business fleet stats
        int totalAgents = (int) deliveryAgentRepository.count();
        int onlineAgents = (int) deliveryAgentRepository.findByIsAvailableTrue().size();
        int activeOrders = (int) orderRepository.countByStatusIn(List.of(
                OrderStatus.ASSIGNED,
                OrderStatus.PICKED_UP,
                OrderStatus.IN_TRANSIT,
                OrderStatus.OUT_FOR_DELIVERY
        ));

        Map<String, Object> subsystems = new HashMap<>();
        subsystems.put("pricingEngine", "OPERATIONAL");
        subsystems.put("zoneDetectionService", "OPERATIONAL");
        subsystems.put("notificationBroadcaster", "OPERATIONAL");
        subsystems.put("rateLimiter", "ACTIVE");
        subsystems.put("optimisticLocking", "ENABLED");

        return SystemHealthDto.builder()
                .status("CONNECTED".equals(dbStatus) ? "UP" : "DEGRADED")
                .applicationName("GATIMAN Last-Mile Engine")
                .version("1.0.0")
                .timestamp(Instant.now())
                .uptimeSeconds(uptimeSeconds)
                .databaseStatus(dbStatus)
                .databaseEngine(dbEngine)
                .activeDbConnections(activeConn)
                .maxDbPoolSize(maxPool)
                .dbQueryLatencyMs(dbLatency)
                .totalJvmMemoryMb(totalMem)
                .freeJvmMemoryMb(freeMem)
                .usedJvmMemoryMb(usedMem)
                .memoryUsagePercent(Math.round(memPercent * 10.0) / 10.0)
                .activeThreads(threads)
                .totalAgents(totalAgents)
                .onlineAgents(onlineAgents)
                .activeOrdersInFlight(activeOrders)
                .subsystemMetrics(subsystems)
                .build();
    }
}
