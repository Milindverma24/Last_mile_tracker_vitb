package com.gatiman.service.impl;

import com.gatiman.dto.agent.AgentAvailabilityRequest;
import com.gatiman.dto.agent.AgentLocationUpdateRequest;
import com.gatiman.dto.agent.AgentResponse;
import com.gatiman.entity.*;
import com.gatiman.exception.BusinessRuleException;
import com.gatiman.exception.ResourceNotFoundException;
import com.gatiman.repository.AgentLocationRepository;
import com.gatiman.repository.DeliveryAgentRepository;
import com.gatiman.repository.OrderAssignmentRepository;
import com.gatiman.service.DeliveryAgentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DeliveryAgentServiceImpl implements DeliveryAgentService {

    private final DeliveryAgentRepository deliveryAgentRepository;
    private final OrderAssignmentRepository orderAssignmentRepository;
    private final AgentLocationRepository agentLocationRepository;

    @Override
    @Transactional(readOnly = true)
    public List<AgentResponse> getAllAgents() {
        return deliveryAgentRepository.findAll().stream()
                .map(this::mapToAgentResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AgentResponse getAgentById(Long id) {
        DeliveryAgent agent = deliveryAgentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Agent not found with ID: " + id));
        return mapToAgentResponse(agent);
    }

    @Override
    @Transactional(readOnly = true)
    public AgentResponse getAgentByUserId(Long userId) {
        DeliveryAgent agent = deliveryAgentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent profile not found for user ID: " + userId));
        return mapToAgentResponse(agent);
    }

    @Override
    @Transactional
    public AgentResponse updateAvailability(Long agentId, AgentAvailabilityRequest request) {
        DeliveryAgent agent = deliveryAgentRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent not found with ID: " + agentId));

        agent.setIsAvailable(request.getIsAvailable());
        DeliveryAgent updated = deliveryAgentRepository.save(agent);
        return mapToAgentResponse(updated);
    }

    @Override
    @Transactional
    public AgentResponse updateLocation(Long agentId, AgentLocationUpdateRequest request) {
        DeliveryAgent agent = deliveryAgentRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent not found with ID: " + agentId));

        agent.setCurrentLatitude(request.getLatitude());
        agent.setCurrentLongitude(request.getLongitude());
        agent.setLastLocationUpdate(Instant.now());

        AgentLocation log = AgentLocation.builder()
                .agent(agent)
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .speed(request.getSpeed())
                .heading(request.getHeading())
                .build();
        agentLocationRepository.save(log);

        DeliveryAgent updated = deliveryAgentRepository.save(agent);
        return mapToAgentResponse(updated);
    }

    @Override
    @Transactional
    public DeliveryAgent autoAssignNearestAgent(Order order) {
        List<DeliveryAgent> availableAgents = deliveryAgentRepository
                .findByIsAvailableTrueAndStatus("ACTIVE");

        List<DeliveryAgent> eligibleAgents = availableAgents.stream()
                .filter(a -> a.getCurrentActiveOrders() < a.getMaxActiveOrders())
                .toList();

        if (eligibleAgents.isEmpty()) {
            throw new BusinessRuleException("No active delivery agents with capacity are currently online.");
        }

        DeliveryAgent selectedAgent = eligibleAgents.stream()
                .min(Comparator.comparingDouble(agent -> calculateAgentScore(agent, order)))
                .orElse(eligibleAgents.get(0));

        executeAssignment(order, selectedAgent, "AUTO", null, BigDecimal.valueOf(2.5));
        return selectedAgent;
    }

    @Override
    @Transactional
    public DeliveryAgent assignAgentManually(Order order, Long agentId, User assignedBy) {
        DeliveryAgent agent = deliveryAgentRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery agent not found with ID: " + agentId));

        if (!agent.getIsAvailable() || !"ACTIVE".equalsIgnoreCase(agent.getStatus())) {
            throw new BusinessRuleException("Selected agent is currently offline or inactive.");
        }

        if (agent.getCurrentActiveOrders() >= agent.getMaxActiveOrders()) {
            throw new BusinessRuleException("Selected agent has reached max active orders capacity (" + agent.getMaxActiveOrders() + ").");
        }

        executeAssignment(order, agent, "MANUAL", assignedBy, BigDecimal.ZERO);
        return agent;
    }

    private double calculateAgentScore(DeliveryAgent agent, Order order) {
        double score = agent.getCurrentActiveOrders() * 2.0;

        if (agent.getAssignedZone() != null && order.getPickupZone() != null &&
                agent.getAssignedZone().getId().equals(order.getPickupZone().getId())) {
            score -= 10.0;
        }

        if (agent.getCurrentLatitude() != null && agent.getCurrentLongitude() != null &&
                order.getPickupArea() != null && order.getPickupArea().getLatitude() != null &&
                order.getPickupArea().getLongitude() != null) {
            double distanceKm = haversineDistance(
                    agent.getCurrentLatitude(), agent.getCurrentLongitude(),
                    order.getPickupArea().getLatitude(), order.getPickupArea().getLongitude()
            );
            score += distanceKm;
        }

        return score;
    }

    private double haversineDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private void executeAssignment(
            Order order,
            DeliveryAgent agent,
            String type,
            User assignedBy,
            BigDecimal estimatedDistance) {

        agent.setCurrentActiveOrders(agent.getCurrentActiveOrders() + 1);
        deliveryAgentRepository.save(agent);

        OrderAssignment assignment = OrderAssignment.builder()
                .order(order)
                .agent(agent)
                .assignmentType(type)
                .status("ASSIGNED")
                .assignedByUser(assignedBy)
                .distanceKmAtAssignment(estimatedDistance)
                .build();
        orderAssignmentRepository.save(assignment);

        order.setAssignedAgent(agent);
    }

    private AgentResponse mapToAgentResponse(DeliveryAgent agent) {
        return AgentResponse.builder()
                .id(agent.getId())
                .userId(agent.getUser().getId())
                .name(agent.getUser().getFirstName() + " " + agent.getUser().getLastName())
                .email(agent.getUser().getEmail())
                .phoneNumber(agent.getUser().getPhoneNumber())
                .vehicleType(agent.getVehicleType())
                .vehicleNumber(agent.getVehicleNumber())
                .isAvailable(agent.getIsAvailable())
                .active(agent.getActive())
                .maxActiveOrders(agent.getMaxActiveOrders())
                .currentActiveOrders(agent.getCurrentActiveOrders())
                .assignedZoneId(agent.getAssignedZone() != null ? agent.getAssignedZone().getId() : null)
                .assignedZoneName(agent.getAssignedZone() != null ? agent.getAssignedZone().getName() : "")
                .currentLatitude(agent.getCurrentLatitude())
                .currentLongitude(agent.getCurrentLongitude())
                .lastLocationUpdate(agent.getLastLocationUpdate())
                .status(agent.getStatus())
                .build();
    }
}
