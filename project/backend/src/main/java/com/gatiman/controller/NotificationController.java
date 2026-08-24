package com.gatiman.controller;

import com.gatiman.dto.common.ApiResponse;
import com.gatiman.entity.Notification;
import com.gatiman.security.CustomUserDetails;
import com.gatiman.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "In-app alerts and delivery event notifications")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @Operation(summary = "Get all notifications for currently authenticated user (paginated or list)")
    public ResponseEntity<ApiResponse<List<Notification>>> getMyNotifications(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        List<Notification> notifications = notificationService.getUserNotifications(userDetails.getUser().getId());
        return ResponseEntity.ok(ApiResponse.ok("Notifications retrieved", notifications));
    }

    @GetMapping("/page")
    @Operation(summary = "Get paginated notifications for currently authenticated user")
    public ResponseEntity<ApiResponse<Page<Notification>>> getMyNotificationsPaged(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<Notification> page = notificationService.getUserNotifications(userDetails.getUser().getId(), pageable);
        return ResponseEntity.ok(ApiResponse.ok("Notifications retrieved", page));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get unread notification count for current user")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        long count = notificationService.getUnreadCount(userDetails.getUser().getId());
        return ResponseEntity.ok(ApiResponse.ok("Unread count retrieved", Map.of("unreadCount", count)));
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark a notification as read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.ok("Notification marked as read", null));
    }

    @PatchMapping("/read-all")
    @Operation(summary = "Mark all notifications as read for current user")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        notificationService.markAllAsRead(userDetails.getUser().getId());
        return ResponseEntity.ok(ApiResponse.ok("All notifications marked as read", null));
    }
}
