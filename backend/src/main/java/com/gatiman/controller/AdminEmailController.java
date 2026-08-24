package com.gatiman.controller;

import com.gatiman.dto.common.ApiResponse;
import com.gatiman.entity.EmailLog;
import com.gatiman.entity.Order;
import com.gatiman.enums.EmailEventType;
import com.gatiman.enums.EmailStatus;
import com.gatiman.repository.EmailLogRepository;
import com.gatiman.repository.OrderRepository;
import com.gatiman.service.EmailService;
import com.gatiman.service.EmailTemplateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.EnumMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/emails")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin Email Management", description = "Monitor, retry, preview and test automated delivery emails")
@PreAuthorize("hasRole('ADMIN')")
public class AdminEmailController {

    private final EmailLogRepository emailLogRepository;
    private final EmailService emailService;
    private final EmailTemplateService emailTemplateService;
    private final OrderRepository orderRepository;

    @GetMapping
    @Operation(summary = "Get paginated email logs with filtering and search")
    public ResponseEntity<ApiResponse<Page<EmailLog>>> getEmailLogs(
            @RequestParam(required = false) EmailStatus status,
            @RequestParam(required = false) EmailEventType eventType,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<EmailLog> logs = emailLogRepository.searchLogs(status, eventType, search, pageable);
        return ResponseEntity.ok(ApiResponse.ok(logs));
    }

    @GetMapping("/stats")
    @Operation(summary = "Get overall email delivery metrics and counts")
    public ResponseEntity<ApiResponse<EmailStatsResponse>> getEmailStats() {
        long total = emailLogRepository.count();
        long sent = emailLogRepository.countByStatus(EmailStatus.SENT);
        long failed = emailLogRepository.countByStatus(EmailStatus.FAILED);
        long pending = emailLogRepository.countByStatus(EmailStatus.PENDING);
        long retrying = emailLogRepository.countByStatus(EmailStatus.RETRYING);

        Map<EmailEventType, Long> eventCounts = new EnumMap<>(EmailEventType.class);
        for (EmailEventType type : EmailEventType.values()) {
            eventCounts.put(type, emailLogRepository.countByEventType(type));
        }

        double successRate = total > 0 ? ((double) sent / total) * 100.0 : 100.0;

        EmailStatsResponse stats = EmailStatsResponse.builder()
                .totalEmails(total)
                .sentCount(sent)
                .failedCount(failed)
                .pendingCount(pending)
                .retryingCount(retrying)
                .successRate(Math.round(successRate * 10.0) / 10.0)
                .eventCounts(eventCounts)
                .build();

        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get specific email log record by ID")
    public ResponseEntity<ApiResponse<EmailLog>> getEmailLogById(@PathVariable Long id) {
        EmailLog emailLog = emailLogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Email log not found with ID: " + id));
        return ResponseEntity.ok(ApiResponse.ok(emailLog));
    }

    @PostMapping("/{id}/retry")
    @Operation(summary = "Retry dispatching a failed email")
    public ResponseEntity<ApiResponse<EmailLog>> retryEmail(@PathVariable Long id) {
        EmailLog retried = emailService.retryEmail(id);
        return ResponseEntity.ok(ApiResponse.ok("Email retry dispatched successfully", retried));
    }

    @GetMapping("/preview")
    @Transactional(readOnly = true)
    @Operation(summary = "Preview rendered HTML email template for any event type")
    public ResponseEntity<ApiResponse<String>> previewEmailTemplate(
            @RequestParam(defaultValue = "ON_THE_WAY") EmailEventType eventType,
            @RequestParam(required = false) Long orderId
    ) {
        Order order = null;
        if (orderId != null) {
            order = orderRepository.findById(orderId).orElse(null);
        }
        if (order == null) {
            order = orderRepository.findAll().stream().findFirst().orElse(null);
        }

        String recipientName = "Priya Sharma";
        try {
            if (order != null && order.getCustomer() != null && order.getCustomer().getUser() != null) {
                recipientName = order.getCustomer().getUser().getFullName();
            }
        } catch (Exception ignored) {
        }

        String html = emailTemplateService.buildHtmlEmail(
                eventType,
                order,
                recipientName,
                2.4,
                12,
                null,
                "http://localhost:5173"
        );

        return ResponseEntity.ok(ApiResponse.ok(html));
    }

    @PostMapping("/test-send")
    @Operation(summary = "Send a test email for any event type to a specified email address")
    public ResponseEntity<ApiResponse<String>> sendTestEmail(@RequestBody TestEmailRequest request) {
        emailService.sendTestEmail(request.getToEmail(), request.getEventType(), request.getOrderId());
        return ResponseEntity.ok(ApiResponse.ok("Test email dispatched to " + request.getToEmail()));
    }

    @Data
    @Builder
    public static class EmailStatsResponse {
        private long totalEmails;
        private long sentCount;
        private long failedCount;
        private long pendingCount;
        private long retryingCount;
        private double successRate;
        private Map<EmailEventType, Long> eventCounts;
    }

    @Data
    public static class TestEmailRequest {
        private String toEmail;
        private EmailEventType eventType = EmailEventType.ON_THE_WAY;
        private Long orderId;
    }
}
