package com.gatiman.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class AnalyticsResponse {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderAnalyticsDto {
        private Long totalOrders;
        private Long deliveredOrders;
        private Long failedOrders;
        private Long rescheduledOrders;
        private Long cancelledOrders;
        private Long inTransitOrders;
        private Double successRate;
        private Double failureRate;
        private Double rescheduleRate;
        private List<DailyTrendDto> dailyTrends;
        private Map<String, Long> statusDistribution;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyTrendDto {
        private String date; // YYYY-MM-DD
        private Long totalCount;
        private Long deliveredCount;
        private Long failedCount;
        private BigDecimal revenue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ZoneAnalyticsDto {
        private Long zoneId;
        private String zoneCode;
        private String zoneName;
        private Long pickupCount;
        private Long dropCount;
        private Long deliveredCount;
        private Long failedCount;
        private Double averageAttempts;
        private BigDecimal totalCharges;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AgentPerformanceDto {
        private Long agentId;
        private String agentName;
        private String vehicleNumber;
        private String vehicleType;
        private String assignedZoneName;
        private Integer currentWorkload;
        private Integer maxActiveOrders;
        private Long assignedTotal;
        private Long completedTotal;
        private Long failedTotal;
        private Double successRate;
        private Double averageAttempts;
        private Boolean isAvailable;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FailureAnalyticsDto {
        private Long totalFailures;
        private Map<String, Long> failureByReason;
        private Map<String, Long> failureByZone;
        private List<DailyTrendDto> failureTrends;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenueAnalyticsDto {
        private BigDecimal totalDeliveryCharges;
        private BigDecimal baseCharges;
        private BigDecimal codSurcharges;
        private BigDecimal b2bCharges;
        private BigDecimal b2cCharges;
        private BigDecimal intraZoneCharges;
        private BigDecimal interZoneCharges;
    }
}
