package com.gatiman.controller;

import com.gatiman.dto.admin.AnalyticsResponse;
import com.gatiman.dto.admin.AuditLogResponse;
import com.gatiman.dto.admin.DashboardResponse;
import com.gatiman.dto.admin.SystemHealthDto;
import com.gatiman.dto.agent.AssignmentResponse;
import com.gatiman.dto.common.ApiResponse;
import com.gatiman.dto.order.RescheduleResponse;
import com.gatiman.dto.order.RescheduleReviewRequest;
import com.gatiman.entity.Customer;
import com.gatiman.entity.User;
import com.gatiman.enums.Role;
import com.gatiman.repository.CustomerRepository;
import com.gatiman.repository.*;
import com.gatiman.service.AgentAssignmentService;
import com.gatiman.service.AnalyticsService;
import com.gatiman.service.AuditService;
import com.gatiman.service.RescheduleService;
import com.gatiman.service.SystemHealthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Operations cockpit, fleet metrics, and system analytics")
public class AdminController {

    private final AnalyticsService analyticsService;
    private final RescheduleService rescheduleService;
    private final AgentAssignmentService agentAssignmentService;
    private final AuditService auditService;
    private final SystemHealthService systemHealthService;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    private final TrackingEventRepository trackingEventRepository;
    private final DeliveryAttemptRepository deliveryAttemptRepository;
    private final OrderAssignmentRepository orderAssignmentRepository;
    private final RescheduleRequestRepository rescheduleRequestRepository;
    private final EmailLogRepository emailLogRepository;
    private final NotificationRepository notificationRepository;
    private final DeliveryAgentRepository deliveryAgentRepository;

    @GetMapping("/customers")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List all registered retail and enterprise customer accounts")
    public ResponseEntity<ApiResponse<List<CustomerAccountDto>>> getAllCustomers() {
        List<User> customerUsers = userRepository.findByRole(Role.CUSTOMER);
        List<CustomerAccountDto> dtos = customerUsers.stream().map(u -> {
            Customer cust = customerRepository.findByUserId(u.getId()).orElse(null);
            long orderCount = cust != null ? orderRepository.countByCustomerId(cust.getId()) : 0L;
            String type = cust != null && cust.getCustomerType() != null ? cust.getCustomerType().name() : "B2C";
            String zone = (u.getCity() != null && !u.getCity().isBlank()) 
                    ? u.getCity() + (u.getPinCode() != null ? " (" + u.getPinCode() + ")" : "")
                    : "National Express Zone";

            return CustomerAccountDto.builder()
                    .id(cust != null ? cust.getId() : u.getId())
                    .userId(u.getId())
                    .name(u.getFullName() != null && !u.getFullName().isBlank() ? u.getFullName() : "Customer " + u.getId())
                    .email(u.getEmail())
                    .phone(u.getPhoneNumber() != null && !u.getPhoneNumber().isBlank() ? u.getPhoneNumber() : "—")
                    .type(type)
                    .companyName(cust != null ? cust.getCompanyName() : null)
                    .gstNumber(cust != null ? cust.getGstNumber() : null)
                    .address(u.getAddress())
                    .city(u.getCity())
                    .state(u.getState())
                    .pinCode(u.getPinCode())
                    .zone(zone)
                    .totalBookings(orderCount)
                    .createdAt(u.getCreatedAt())
                    .build();
        }).toList();

        return ResponseEntity.ok(ApiResponse.ok("Customer accounts retrieved", dtos));
    }

    @lombok.Data
    @lombok.Builder
    public static class CustomerAccountDto {
        private Long id;
        private Long userId;
        private String name;
        private String email;
        private String phone;
        private String type;
        private String companyName;
        private String gstNumber;
        private String address;
        private String city;
        private String state;
        private String pinCode;
        private String zone;
        private long totalBookings;
        private java.time.Instant createdAt;
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get high-level operations KPIs and distribution charts")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard() {
        DashboardResponse response = analyticsService.getDashboardSummary();
        return ResponseEntity.ok(ApiResponse.ok("Dashboard KPIs retrieved", response));
    }

    @GetMapping("/dashboard/summary")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get operational summary metrics")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboardSummary() {
        DashboardResponse response = analyticsService.getDashboardSummary();
        return ResponseEntity.ok(ApiResponse.ok("Dashboard summary retrieved", response));
    }

    @GetMapping("/analytics/orders")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get order delivery trends and status analytics")
    public ResponseEntity<ApiResponse<AnalyticsResponse.OrderAnalyticsDto>> getOrderAnalytics(
            @RequestParam(defaultValue = "7d") String range) {
        AnalyticsResponse.OrderAnalyticsDto response = analyticsService.getOrderAnalytics(range);
        return ResponseEntity.ok(ApiResponse.ok("Order analytics retrieved", response));
    }

    @GetMapping("/analytics/zones")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get zone volume, SLA and charge distribution")
    public ResponseEntity<ApiResponse<List<AnalyticsResponse.ZoneAnalyticsDto>>> getZoneAnalytics() {
        List<AnalyticsResponse.ZoneAnalyticsDto> response = analyticsService.getZoneAnalytics();
        return ResponseEntity.ok(ApiResponse.ok("Zone analytics retrieved", response));
    }

    @GetMapping("/analytics/agents")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get fleet workload, completion rate, and performance metrics")
    public ResponseEntity<ApiResponse<List<AnalyticsResponse.AgentPerformanceDto>>> getAgentPerformance() {
        List<AnalyticsResponse.AgentPerformanceDto> response = analyticsService.getAgentPerformance();
        return ResponseEntity.ok(ApiResponse.ok("Agent performance analytics retrieved", response));
    }

    @GetMapping("/analytics/failures")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get failed delivery reasons breakdown")
    public ResponseEntity<ApiResponse<AnalyticsResponse.FailureAnalyticsDto>> getFailureAnalytics() {
        AnalyticsResponse.FailureAnalyticsDto response = analyticsService.getFailureAnalytics();
        return ResponseEntity.ok(ApiResponse.ok("Failure analytics retrieved", response));
    }

    @GetMapping("/analytics/revenue")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get realized delivery charges breakdown")
    public ResponseEntity<ApiResponse<AnalyticsResponse.RevenueAnalyticsDto>> getRevenueAnalytics() {
        AnalyticsResponse.RevenueAnalyticsDto response = analyticsService.getRevenueAnalytics();
        return ResponseEntity.ok(ApiResponse.ok("Delivery charge analytics retrieved", response));
    }

    @GetMapping("/reschedule-requests")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List customer reschedule requests with status filter and pagination")
    public ResponseEntity<ApiResponse<Page<RescheduleResponse>>> getRescheduleRequests(
            @RequestParam(required = false, defaultValue = "ALL") String status,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<RescheduleResponse> response = rescheduleService.getRescheduleRequests(status, pageable);
        return ResponseEntity.ok(ApiResponse.ok("Reschedule requests retrieved", response));
    }

    @PostMapping("/reschedule-requests/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Approve customer reschedule request, create next delivery attempt and assign driver")
    public ResponseEntity<ApiResponse<RescheduleResponse>> approveReschedule(
            @PathVariable Long id,
            @RequestBody(required = false) RescheduleReviewRequest reviewRequest,
            @AuthenticationPrincipal UserDetails userDetails) {
        User admin = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        RescheduleResponse response = rescheduleService.approveReschedule(id, reviewRequest, admin);
        return ResponseEntity.ok(ApiResponse.ok("Reschedule approved and driver assigned", response));
    }

    @PostMapping("/reschedule-requests/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Reject customer reschedule request with reason")
    public ResponseEntity<ApiResponse<RescheduleResponse>> rejectReschedule(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        String reason = body.getOrDefault("rejectionReason", "Schedule slot unavailable");
        User admin = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        RescheduleResponse response = rescheduleService.rejectReschedule(id, reason, admin);
        return ResponseEntity.ok(ApiResponse.ok("Reschedule rejected", response));
    }

    @PostMapping("/orders/{orderId}/reassign")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Reassign an order to a new delivery driver")
    public ResponseEntity<ApiResponse<AssignmentResponse>> reassignOrder(
            @PathVariable Long orderId,
            @RequestBody Map<String, Long> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long agentId = body.get("agentId");
        User admin = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        AssignmentResponse response = agentAssignmentService.reassignOrder(orderId, agentId, admin);
        return ResponseEntity.ok(ApiResponse.ok("Driver partner reassigned successfully", response));
    }

    @GetMapping("/audit-logs")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Retrieve system audit trail")
    public ResponseEntity<ApiResponse<Page<AuditLogResponse>>> getAuditLogs(
            @PageableDefault(size = 30) Pageable pageable) {
        Page<AuditLogResponse> response = auditService.getAuditLogs(pageable);
        return ResponseEntity.ok(ApiResponse.ok("Audit logs retrieved", response));
    }

    @GetMapping("/system/health")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get deep system health, database probe latency, pool metrics and JVM state")
    public ResponseEntity<ApiResponse<SystemHealthDto>> getSystemHealth() {
        SystemHealthDto health = systemHealthService.getSystemHealth();
        return ResponseEntity.ok(ApiResponse.ok("System health metrics retrieved", health));
    }

    @PostMapping("/system/reset-data")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    @Operation(summary = "Reset database transactional data for fresh testing")
    public ResponseEntity<ApiResponse<String>> resetTransactionalData() {
        rescheduleRequestRepository.deleteAll();
        deliveryAttemptRepository.deleteAll();
        orderAssignmentRepository.deleteAll();
        trackingEventRepository.deleteAll();
        notificationRepository.deleteAll();
        emailLogRepository.deleteAll();
        orderRepository.deleteAll();

        // Reset all agents to available and 0 active workload
        deliveryAgentRepository.findAll().forEach(agent -> {
            agent.setCurrentActiveOrders(0);
            agent.setMaxActiveOrders(25);
            agent.setIsAvailable(true);
            agent.setStatus("ACTIVE");
            deliveryAgentRepository.save(agent);
        });

        // Clean up temporary load test customer accounts (preserve core system profiles)
        List<User> users = userRepository.findAll();
        for (User u : users) {
            String email = u.getEmail().toLowerCase();
            boolean isCore = email.equals("admin@gatiman.com") ||
                             email.equals("customer@gatiman.com") ||
                             email.equals("agent@gatiman.com") ||
                             email.equals("agent.car@gatiman.com") ||
                             email.equals("agent.tempo@gatiman.com") ||
                             email.equals("anshverma24112005@gmail.com");
            if (!isCore) {
                customerRepository.findByUserId(u.getId()).ifPresent(customerRepository::delete);
                userRepository.delete(u);
            }
        }

        return ResponseEntity.ok(ApiResponse.ok("Storage cleared and transactional state reset successfully. Fleet ready for auto-dispatch."));
    }
}
