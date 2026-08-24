package com.gatiman.service;

import com.gatiman.dto.agent.AssignmentResponse;
import com.gatiman.entity.DeliveryAgent;
import com.gatiman.entity.Order;
import com.gatiman.entity.User;

public interface AgentAssignmentService {
    AssignmentResponse autoAssign(Long orderId);
    AssignmentResponse manualAssign(Long orderId, Long agentId, User assignedBy);
    AssignmentResponse reassignOrder(Long orderId, Long newAgentId, User adminUser);
    DeliveryAgent selectNearestEligibleAgent(Order order);
}
