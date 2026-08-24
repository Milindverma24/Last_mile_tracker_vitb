package com.gatiman.service;

import com.gatiman.entity.DeliveryAgent;
import com.gatiman.entity.Order;

import java.util.List;

public interface AgentEligibilityService {
    boolean isAgentEligible(DeliveryAgent agent);
    boolean isAgentEligibleForOrder(DeliveryAgent agent, Order order);
    void validateAgentEligibility(DeliveryAgent agent);
    List<DeliveryAgent> filterEligibleAgents(List<DeliveryAgent> candidateAgents, Order order);
}
