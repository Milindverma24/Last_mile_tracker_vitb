package com.gatiman.service.impl;

import com.gatiman.dto.agent.AssignmentResponse;
import com.gatiman.entity.*;
import com.gatiman.enums.OrderStatus;
import com.gatiman.exception.BusinessRuleException;
import com.gatiman.exception.ResourceNotFoundException;
import com.gatiman.repository.*;
import com.gatiman.service.AgentAssignmentService;
import com.gatiman.service.AgentEligibilityService;
import com.gatiman.service.AuditService;
import com.gatiman.service.NotificationService;
import com.gatiman.service.TrackingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AgentAssignmentServiceImpl implements AgentAssignmentService {

    private final OrderRepository orderRepository;
    private final DeliveryAgentRepository agentRepository;
    private final OrderAssignmentRepository assignmentRepository;
    private final DeliveryAttemptRepository attemptRepository;
    private final AgentEligibilityService eligibilityService;
    private final TrackingService trackingService;
    private final NotificationService notificationService;
    private final AuditService auditService;

    private static final double EARTH_RADIUS_KM = 6371.0;

    @Override
    @Transactional
    public AssignmentResponse autoAssign(Long orderId) {
        log.info("Executing auto-dispatch algorithm for Order ID: {}", orderId);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("ORDER_NOT_FOUND: Order not found with ID " + orderId));

        if (order.getStatus() != OrderStatus.CREATED && order.getStatus() != OrderStatus.RESCHEDULED) {
            throw new BusinessRuleException(String.format("ORDER_ALREADY_ASSIGNED: Order %s is in state '%s' and cannot be auto-assigned.",
                    order.getTrackingNumber(), order.getStatus()));
        }

        DeliveryAgent selectedAgent = selectNearestEligibleAgent(order);
        if (selectedAgent == null) {
            log.warn("No eligible delivery agent available for Order {}", order.getTrackingNumber());
            throw new BusinessRuleException("NO_AVAILABLE_AGENT: No delivery agent is currently available. The order has been created and is awaiting assignment.");
        }

        return executeAssignment(order, selectedAgent, "AUTO", null, "System Auto-Dispatch Engine (Proximity & Workload Balanced)");
    }

    @Override
    @Transactional
    public AssignmentResponse manualAssign(Long orderId, Long agentId, User assignedBy) {
        log.info("Executing manual dispatch for Order ID: {} to Agent ID: {}", orderId, agentId);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("ORDER_NOT_FOUND: Order not found with ID " + orderId));

        if (order.getStatus() != OrderStatus.CREATED && order.getStatus() != OrderStatus.RESCHEDULED) {
            throw new BusinessRuleException(String.format("ORDER_ALREADY_ASSIGNED: Order %s is in state '%s' and cannot be assigned.",
                    order.getTrackingNumber(), order.getStatus()));
        }

        DeliveryAgent agent = agentRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("AGENT_NOT_FOUND: Delivery agent not found with ID " + agentId));

        eligibilityService.validateAgentEligibility(agent);

        String actorName = assignedBy != null ? assignedBy.getFirstName() + " " + assignedBy.getLastName() : "Operations Admin";
        return executeAssignment(order, agent, "MANUAL", assignedBy, "Manual dispatch by " + actorName);
    }

    @Override
    @Transactional
    public AssignmentResponse reassignOrder(Long orderId, Long newAgentId, User adminUser) {
        log.info("Reassigning Order ID: {} to new Agent ID: {} by admin: {}", orderId, newAgentId, adminUser.getEmail());

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("ORDER_NOT_FOUND: Order not found with ID " + orderId));

        DeliveryAgent newAgent = agentRepository.findById(newAgentId)
                .orElseThrow(() -> new ResourceNotFoundException("AGENT_NOT_FOUND: Delivery agent not found with ID " + newAgentId));

        eligibilityService.validateAgentEligibility(newAgent);

        DeliveryAgent previousAgent = order.getAssignedAgent();

        // 1. Decrement previous agent workload
        if (previousAgent != null && previousAgent.getCurrentActiveOrders() != null && previousAgent.getCurrentActiveOrders() > 0) {
            previousAgent.setCurrentActiveOrders(previousAgent.getCurrentActiveOrders() - 1);
            agentRepository.save(previousAgent);
        }

        // 2. Increment new agent workload
        newAgent.setCurrentActiveOrders(newAgent.getCurrentActiveOrders() + 1);
        agentRepository.save(newAgent);

        // 3. Mark previous assignments as REASSIGNED
        List<OrderAssignment> activeAssignments = assignmentRepository.findByOrderIdOrderByAssignedAtDesc(orderId);
        for (OrderAssignment a : activeAssignments) {
            if ("ASSIGNED".equalsIgnoreCase(a.getStatus())) {
                a.setStatus("REASSIGNED");
                assignmentRepository.save(a);
            }
        }

        // 4. Create new OrderAssignment
        OrderAssignment newAssignment = OrderAssignment.builder()
                .order(order)
                .agent(newAgent)
                .assignedByUser(adminUser)
                .assignmentType("REASSIGN")
                .assignedAt(Instant.now())
                .status("ASSIGNED")
                .build();
        assignmentRepository.save(newAssignment);

        // 5. Update order
        order.setAssignedAgent(newAgent);
        order.setStatus(OrderStatus.ASSIGNED);
        order.setUpdatedAt(Instant.now());
        orderRepository.save(order);

        // 6. Record tracking event
        String note = String.format("Driver partner reassigned from %s to %s (%s) by %s",
                previousAgent != null ? previousAgent.getName() : "None",
                newAgent.getName(),
                newAgent.getVehicleNumber(),
                adminUser.getFirstName() + " " + adminUser.getLastName());

        trackingService.recordEvent(
                order,
                order.getStatus(),
                OrderStatus.ASSIGNED,
                adminUser,
                adminUser.getFirstName() + " " + adminUser.getLastName(),
                "ADMIN",
                note,
                null,
                null
        );

        // 7. Notification & Audit Log
        notificationService.notifyAgentReassigned(order, previousAgent, newAgent);
        auditService.logAction(
                adminUser.getEmail(),
                "AGENT_REASSIGNED",
                "Order",
                order.getId(),
                note
        );

        return AssignmentResponse.builder()
                .assignmentId(newAssignment.getId())
                .orderId(order.getId())
                .trackingNumber(order.getTrackingNumber())
                .agentId(newAgent.getId())
                .agentName(newAgent.getName())
                .agentPhone(newAgent.getPhoneNumber())
                .vehicleType(newAgent.getVehicleType() != null ? newAgent.getVehicleType().name() : "BIKE")
                .vehicleNumber(newAgent.getVehicleNumber())
                .assignmentType("REASSIGN")
                .assignedAt(newAssignment.getAssignedAt())
                .status(order.getStatus().name())
                .build();
    }

    private AssignmentResponse executeAssignment(Order order, DeliveryAgent agent, String assignmentType, User assignedByUser, String reason) {
        OrderStatus previousStatus = order.getStatus();

        // 1. Create OrderAssignment record
        OrderAssignment assignment = OrderAssignment.builder()
                .order(order)
                .agent(agent)
                .assignedByUser(assignedByUser)
                .assignmentType(assignmentType)
                .assignedAt(Instant.now())
                .status("ASSIGNED")
                .build();
        assignmentRepository.save(assignment);

        // 2. Increment Agent Workload
        agent.setCurrentActiveOrders(agent.getCurrentActiveOrders() + 1);
        agentRepository.save(agent);

        // 3. Update Order Status and Assigned Agent
        order.setAssignedAgent(agent);
        order.setStatus(OrderStatus.ASSIGNED);
        order.setUpdatedAt(Instant.now());
        orderRepository.save(order);

        // 4. Create or update DeliveryAttempt
        DeliveryAttempt attempt = DeliveryAttempt.builder()
                .order(order)
                .agent(agent)
                .attemptNumber(order.getDeliveryAttempts() != null ? order.getDeliveryAttempts().size() + 1 : 1)
                .status("ASSIGNED")
                .scheduledDate(order.getScheduledDeliveryDate())
                .startedAt(Instant.now())
                .build();
        attemptRepository.save(attempt);

        // 5. Append Immutable Tracking Event
        String actorName = assignmentType.equals("AUTO") ? "GATIMAN Dispatch Engine" :
                (assignedByUser != null ? assignedByUser.getFirstName() + " " + assignedByUser.getLastName() : "Admin");
        String actorRole = assignmentType.equals("AUTO") ? "SYSTEM" : "ADMIN";

        trackingService.recordEvent(order, previousStatus, OrderStatus.ASSIGNED, assignedByUser, actorName, actorRole, reason, null, null);

        // 6. Create Notifications
        notificationService.notifyAgentAssigned(order, agent);

        // 7. Audit Log
        auditService.logAction(
                actorName,
                assignmentType.equals("AUTO") ? "AUTO_ASSIGNED" : "MANUALLY_ASSIGNED",
                "Order",
                order.getId(),
                "Assigned to driver " + agent.getName() + " (" + agent.getVehicleNumber() + ")"
        );

        log.info("Order {} successfully assigned to Agent {} ({})", order.getTrackingNumber(), agent.getName(), assignmentType);

        return AssignmentResponse.builder()
                .assignmentId(assignment.getId())
                .orderId(order.getId())
                .trackingNumber(order.getTrackingNumber())
                .agentId(agent.getId())
                .agentName(agent.getName())
                .agentPhone(agent.getPhoneNumber())
                .vehicleType(agent.getVehicleType() != null ? agent.getVehicleType().name() : "BIKE")
                .vehicleNumber(agent.getVehicleNumber())
                .assignmentType(assignmentType)
                .assignedAt(assignment.getAssignedAt())
                .status(order.getStatus().name())
                .build();
    }

    @Override
    public DeliveryAgent selectNearestEligibleAgent(Order order) {
        List<DeliveryAgent> allAgents = agentRepository.findAll();
        List<DeliveryAgent> eligibleAgents = eligibilityService.filterEligibleAgents(allAgents, order);

        if (eligibleAgents.isEmpty()) {
            return null;
        }

        Zone pickupZone = order.getPickupZone();
        Double pickupLat = 28.5535; // Default reference centroid for Delhi NCR
        Double pickupLng = 77.2007;

        return eligibleAgents.stream()
                .min(Comparator.comparingDouble(agent -> calculateAgentProximityScore(agent, pickupZone, pickupLat, pickupLng)))
                .orElse(null);
    }

    private double calculateAgentProximityScore(DeliveryAgent agent, Zone pickupZone, Double pickupLat, Double pickupLng) {
        double score = 0.0;

        // Workload penalty (balance load across fleet)
        int currentWorkload = agent.getCurrentActiveOrders() != null ? agent.getCurrentActiveOrders() : 0;
        score += currentWorkload * 2.0;

        // Zone preference discount
        if (pickupZone != null && agent.getAssignedZone() != null &&
                agent.getAssignedZone().getId().equals(pickupZone.getId())) {
            score -= 10.0;
        }

        // GPS distance component
        if (agent.getCurrentLatitude() != null && agent.getCurrentLongitude() != null &&
                pickupLat != null && pickupLng != null) {
            double distanceKm = calculateHaversineDistance(
                    agent.getCurrentLatitude(), agent.getCurrentLongitude(),
                    pickupLat, pickupLng
            );
            score += distanceKm;
        }

        // Stable tie breaker based on Agent ID
        score += (agent.getId() % 10) * 0.01;

        return score;
    }

    private double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c;
    }
}
