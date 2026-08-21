package com.gatiman.service;

import com.gatiman.dto.agent.AgentAvailabilityRequest;
import com.gatiman.dto.agent.AgentLocationUpdateRequest;
import com.gatiman.dto.agent.AgentResponse;
import com.gatiman.entity.DeliveryAgent;
import com.gatiman.entity.Order;
import com.gatiman.entity.User;
import java.util.List;

public interface DeliveryAgentService {
    List<AgentResponse> getAllAgents();
    AgentResponse getAgentById(Long id);
    AgentResponse getAgentByUserId(Long userId);
    AgentResponse updateAvailability(Long agentId, AgentAvailabilityRequest request);
    AgentResponse updateLocation(Long agentId, AgentLocationUpdateRequest request);

    DeliveryAgent autoAssignNearestAgent(Order order);
    DeliveryAgent assignAgentManually(Order order, Long agentId, User assignedBy);
}
