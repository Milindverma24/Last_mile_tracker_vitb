package com.gatiman.service.impl;

import com.gatiman.dto.order.RescheduleRequestDto;
import com.gatiman.dto.order.RescheduleResponse;
import com.gatiman.dto.order.RescheduleReviewRequest;
import com.gatiman.entity.*;
import com.gatiman.enums.OrderStatus;
import com.gatiman.enums.RescheduleStatus;
import com.gatiman.enums.Role;
import com.gatiman.exception.BusinessRuleException;
import com.gatiman.exception.ResourceNotFoundException;
import com.gatiman.repository.*;
import com.gatiman.service.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class RescheduleServiceImpl implements RescheduleService {

    private final RescheduleRequestRepository rescheduleRequestRepository;
    private final OrderRepository orderRepository;
    private final DeliveryAttemptRepository deliveryAttemptRepository;
    private final OrderAssignmentRepository orderAssignmentRepository;
    private final DeliveryAgentRepository deliveryAgentRepository;
    private final AgentAssignmentService agentAssignmentService;
    private final AgentEligibilityService agentEligibilityService;
    private final TrackingService trackingService;
    private final NotificationService notificationService;
    private final AuditService auditService;

    @Override
    @Transactional
    public RescheduleResponse requestReschedule(Long orderId, RescheduleRequestDto request, User customerUser) {
        log.info("Processing reschedule request for Order ID: {} by user: {}", orderId, customerUser.getEmail());

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("ORDER_NOT_FOUND: Order not found with ID " + orderId));

        // Security check: only order owner or admin can request
        if (customerUser.getRole() == Role.CUSTOMER) {
            if (order.getCustomer() == null || !order.getCustomer().getUser().getId().equals(customerUser.getId())) {
                throw new BusinessRuleException("UNAUTHORIZED_ORDER_ACCESS: You can only reschedule your own orders.");
            }
        }

        // Validate state
        if (order.getStatus() != OrderStatus.FAILED && order.getStatus() != OrderStatus.CREATED) {
            throw new BusinessRuleException("INVALID_STATUS: Only failed delivery shipments can be rescheduled. Current status: " + order.getStatus());
        }

        // Validate date
        if (request.getRequestedDate() == null || request.getRequestedDate().isBefore(LocalDate.now())) {
            throw new BusinessRuleException("INVALID_DATE: Reschedule delivery date cannot be in the past.");
        }

        // Validate no duplicate active request
        Optional<RescheduleRequest> pendingOpt = rescheduleRequestRepository.findFirstByOrderIdAndStatus(orderId, RescheduleStatus.PENDING);
        if (pendingOpt.isPresent()) {
            throw new BusinessRuleException("DUPLICATE_RESCHEDULE: A pending reschedule request already exists for this order.");
        }

        DeliveryAttempt latestAttempt = deliveryAttemptRepository.findTopByOrderIdOrderByAttemptNumberDesc(orderId).orElse(null);

        RescheduleRequest rescheduleRequest = RescheduleRequest.builder()
                .order(order)
                .deliveryAttempt(latestAttempt)
                .requestedByUser(customerUser)
                .requestedDate(request.getRequestedDate())
                .preferredTimeSlot(request.getPreferredTimeSlot())
                .reason(request.getReason())
                .rescheduleNotes(request.getRescheduleNotes())
                .status(RescheduleStatus.PENDING)
                .requestedAt(Instant.now())
                .createdAt(Instant.now())
                .build();

        RescheduleRequest saved = rescheduleRequestRepository.save(rescheduleRequest);

        // Record tracking event
        String note = String.format("Reschedule requested for %s. Reason: %s",
                request.getRequestedDate(), request.getReason() != null ? request.getReason() : "Customer preferred slot");
        trackingService.recordEvent(
                order,
                order.getStatus(),
                order.getStatus(),
                customerUser,
                customerUser.getFirstName() + " " + customerUser.getLastName(),
                "CUSTOMER",
                note,
                null,
                null
        );

        // Notify Admin
        notificationService.notifyRescheduleRequested(order, saved);

        // Audit Log
        auditService.logAction(
                customerUser.getEmail(),
                "RESCHEDULE_REQUESTED",
                "Order",
                order.getId(),
                "Customer requested reschedule for " + request.getRequestedDate()
        );

        return mapToRescheduleResponse(saved);
    }

    @Override
    @Transactional
    public RescheduleResponse approveReschedule(Long rescheduleId, RescheduleReviewRequest review, User adminUser) {
        log.info("Approving reschedule request ID: {} by admin: {}", rescheduleId, adminUser.getEmail());

        RescheduleRequest request = rescheduleRequestRepository.findById(rescheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("RESCHEDULE_NOT_FOUND: Request not found with ID " + rescheduleId));

        if (request.getStatus() != RescheduleStatus.PENDING) {
            throw new BusinessRuleException("INVALID_ACTION: Reschedule request is already " + request.getStatus());
        }

        Order order = request.getOrder();
        OrderStatus previousStatus = order.getStatus();

        // 1. Mark request APPROVED
        request.setStatus(RescheduleStatus.APPROVED);
        request.setReviewedByUser(adminUser);
        request.setReviewedAt(Instant.now());
        RescheduleRequest savedRequest = rescheduleRequestRepository.save(request);

        // 2. Update Order delivery date and increment count
        order.setScheduledDeliveryDate(request.getRequestedDate());
        order.setRescheduleCount(order.getRescheduleCount() + 1);
        order.setUpdatedAt(Instant.now());

        // 3. Resolve eligible agent
        DeliveryAgent assignedAgent = null;
        if (review != null && review.getOverrideAgentId() != null) {
            assignedAgent = deliveryAgentRepository.findById(review.getOverrideAgentId())
                    .orElseThrow(() -> new ResourceNotFoundException("AGENT_NOT_FOUND: Delivery agent not found"));
            agentEligibilityService.validateAgentEligibility(assignedAgent);
        } else {
            assignedAgent = agentAssignmentService.selectNearestEligibleAgent(order);
        }

        int nextAttemptNumber = order.getDeliveryAttempts() != null ? order.getDeliveryAttempts().size() + 1 : 1;

        if (assignedAgent != null) {
            // Increment Agent Load
            assignedAgent.setCurrentActiveOrders(assignedAgent.getCurrentActiveOrders() + 1);
            deliveryAgentRepository.save(assignedAgent);

            // Create OrderAssignment record
            OrderAssignment assignment = OrderAssignment.builder()
                    .order(order)
                    .agent(assignedAgent)
                    .assignedByUser(adminUser)
                    .assignmentType("RESCHEDULE")
                    .assignedAt(Instant.now())
                    .build();
            orderAssignmentRepository.save(assignment);

            // Create DeliveryAttempt #N
            DeliveryAttempt attempt = DeliveryAttempt.builder()
                    .order(order)
                    .agent(assignedAgent)
                    .attemptNumber(nextAttemptNumber)
                    .status("ASSIGNED")
                    .scheduledDate(request.getRequestedDate())
                    .startedAt(Instant.now())
                    .build();
            deliveryAttemptRepository.save(attempt);

            // Update order status
            order.setAssignedAgent(assignedAgent);
            order.setStatus(OrderStatus.ASSIGNED);
            orderRepository.save(order);

            // Tracking event
            String trackingNote = String.format("Reschedule approved for %s. Assigned to driver partner %s (%s)",
                    request.getRequestedDate(), assignedAgent.getName(), assignedAgent.getVehicleNumber());
            trackingService.recordEvent(
                    order,
                    previousStatus,
                    OrderStatus.ASSIGNED,
                    adminUser,
                    adminUser.getFirstName() + " " + adminUser.getLastName(),
                    "ADMIN",
                    trackingNote,
                    null,
                    null
            );

            notificationService.notifyRescheduleApproved(order, savedRequest, assignedAgent);
        } else {
            // No agent available currently
            DeliveryAttempt attempt = DeliveryAttempt.builder()
                    .order(order)
                    .attemptNumber(nextAttemptNumber)
                    .status("PENDING")
                    .scheduledDate(request.getRequestedDate())
                    .build();
            deliveryAttemptRepository.save(attempt);

            order.setStatus(OrderStatus.RESCHEDULED);
            order.setAssignedAgent(null);
            orderRepository.save(order);

            String trackingNote = String.format("Reschedule approved for %s. Awaiting driver dispatch queue.", request.getRequestedDate());
            trackingService.recordEvent(
                    order,
                    previousStatus,
                    OrderStatus.RESCHEDULED,
                    adminUser,
                    adminUser.getFirstName() + " " + adminUser.getLastName(),
                    "ADMIN",
                    trackingNote,
                    null,
                    null
            );

            notificationService.notifyRescheduleApproved(order, savedRequest, null);
        }

        auditService.logAction(
                adminUser.getEmail(),
                "RESCHEDULE_APPROVED",
                "Order",
                order.getId(),
                "Approved reschedule for date: " + request.getRequestedDate()
        );

        return mapToRescheduleResponse(savedRequest);
    }

    @Override
    @Transactional
    public RescheduleResponse rejectReschedule(Long rescheduleId, String rejectionReason, User adminUser) {
        log.info("Rejecting reschedule request ID: {} by admin: {}", rescheduleId, adminUser.getEmail());

        if (rejectionReason == null || rejectionReason.trim().isEmpty()) {
            throw new BusinessRuleException("REJECTION_REASON_REQUIRED: A valid rejection reason must be provided.");
        }

        RescheduleRequest request = rescheduleRequestRepository.findById(rescheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("RESCHEDULE_NOT_FOUND: Request not found with ID " + rescheduleId));

        if (request.getStatus() != RescheduleStatus.PENDING) {
            throw new BusinessRuleException("INVALID_ACTION: Reschedule request is already " + request.getStatus());
        }

        request.setStatus(RescheduleStatus.REJECTED);
        request.setRejectionReason(rejectionReason.trim());
        request.setReviewedByUser(adminUser);
        request.setReviewedAt(Instant.now());
        RescheduleRequest saved = rescheduleRequestRepository.save(request);

        // Tracking event
        trackingService.recordEvent(
                request.getOrder(),
                request.getOrder().getStatus(),
                request.getOrder().getStatus(),
                adminUser,
                adminUser.getFirstName() + " " + adminUser.getLastName(),
                "ADMIN",
                "Reschedule request rejected. Reason: " + rejectionReason.trim(),
                null,
                null
        );

        notificationService.notifyRescheduleRejected(request.getOrder(), rejectionReason.trim());

        auditService.logAction(
                adminUser.getEmail(),
                "RESCHEDULE_REJECTED",
                "Order",
                request.getOrder().getId(),
                "Rejected reschedule request. Reason: " + rejectionReason.trim()
        );

        return mapToRescheduleResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RescheduleResponse> getRescheduleRequests(String statusFilter, Pageable pageable) {
        if (statusFilter != null && !statusFilter.equalsIgnoreCase("ALL")) {
            RescheduleStatus status = RescheduleStatus.valueOf(statusFilter.toUpperCase());
            return rescheduleRequestRepository.findByStatus(status, pageable).map(this::mapToRescheduleResponse);
        }
        return rescheduleRequestRepository.findAllByOrderByCreatedAtDesc(pageable).map(this::mapToRescheduleResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public RescheduleResponse getRescheduleRequestById(Long id) {
        RescheduleRequest req = rescheduleRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RESCHEDULE_NOT_FOUND: Reschedule request not found with ID: " + id));
        return mapToRescheduleResponse(req);
    }

    private RescheduleResponse mapToRescheduleResponse(RescheduleRequest req) {
        Order o = req.getOrder();
        return RescheduleResponse.builder()
                .id(req.getId())
                .orderId(o.getId())
                .trackingNumber(o.getTrackingNumber())
                .customerName(o.getCustomer() != null && o.getCustomer().getUser() != null ?
                        o.getCustomer().getUser().getFirstName() + " " + o.getCustomer().getUser().getLastName() : "Customer")
                .pickupAddress(o.getPickupAddress())
                .dropAddress(o.getDropAddress())
                .dropZoneName(o.getDropZone() != null ? o.getDropZone().getName() : "Destination Zone")
                .requestedDate(req.getRequestedDate())
                .preferredTimeSlot(req.getPreferredTimeSlot())
                .reason(req.getReason())
                .rescheduleNotes(req.getRescheduleNotes())
                .status(req.getStatus())
                .requestedByUserId(req.getRequestedByUser() != null ? req.getRequestedByUser().getId() : null)
                .requestedByName(req.getRequestedByUser() != null ? req.getRequestedByUser().getFirstName() + " " + req.getRequestedByUser().getLastName() : "Customer")
                .reviewedByUserId(req.getReviewedByUser() != null ? req.getReviewedByUser().getId() : null)
                .reviewedByName(req.getReviewedByUser() != null ? req.getReviewedByUser().getFirstName() + " " + req.getReviewedByUser().getLastName() : null)
                .rejectionReason(req.getRejectionReason())
                .requestedAt(req.getRequestedAt())
                .reviewedAt(req.getReviewedAt())
                .build();
    }
}
