package com.gatiman.service;

import com.gatiman.dto.order.RescheduleRequestDto;
import com.gatiman.dto.order.RescheduleResponse;
import com.gatiman.dto.order.RescheduleReviewRequest;
import com.gatiman.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface RescheduleService {
    RescheduleResponse requestReschedule(Long orderId, RescheduleRequestDto request, User customerUser);
    RescheduleResponse approveReschedule(Long rescheduleId, RescheduleReviewRequest review, User adminUser);
    RescheduleResponse rejectReschedule(Long rescheduleId, String rejectionReason, User adminUser);
    Page<RescheduleResponse> getRescheduleRequests(String statusFilter, Pageable pageable);
    RescheduleResponse getRescheduleRequestById(Long id);
}
