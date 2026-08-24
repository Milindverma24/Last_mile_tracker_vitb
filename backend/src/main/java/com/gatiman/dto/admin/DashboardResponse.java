package com.gatiman.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    private Long totalOrders;
    private Long todayOrders;
    private Long pendingOrders;
    private Long assignedOrders;
    private Long inTransitOrders;
    private Long outForDelivery;
    private Long deliveredOrders;
    private Long failedOrders;
    private Long rescheduledOrders;
    private Long availableAgents;
    private Long totalAgents;
    private BigDecimal totalRevenue;
    private Long b2cCount;
    private Long b2bCount;
    private Map<String, Long> ordersByStatus;
    private Map<String, Long> ordersByZone;
}
