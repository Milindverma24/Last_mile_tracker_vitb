package com.gatiman.service;

import com.gatiman.dto.admin.AnalyticsResponse;
import com.gatiman.dto.admin.DashboardResponse;

import java.util.List;

public interface AnalyticsService {
    DashboardResponse getDashboardSummary();
    AnalyticsResponse.OrderAnalyticsDto getOrderAnalytics(String range);
    List<AnalyticsResponse.ZoneAnalyticsDto> getZoneAnalytics();
    List<AnalyticsResponse.AgentPerformanceDto> getAgentPerformance();
    AnalyticsResponse.FailureAnalyticsDto getFailureAnalytics();
    AnalyticsResponse.RevenueAnalyticsDto getRevenueAnalytics();
}
