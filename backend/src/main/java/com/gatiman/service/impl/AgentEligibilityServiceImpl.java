package com.gatiman.service.impl;

import com.gatiman.entity.DeliveryAgent;
import com.gatiman.entity.Order;
import com.gatiman.exception.BusinessRuleException;
import com.gatiman.service.AgentEligibilityService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
public class AgentEligibilityServiceImpl implements AgentEligibilityService {

    @Override
    public boolean isAgentEligible(DeliveryAgent agent) {
        if (agent == null) return false;
        if (!Boolean.TRUE.equals(agent.getActive())) return false;
        if (!Boolean.TRUE.equals(agent.getIsAvailable())) return false;

        int activeOrders = agent.getCurrentActiveOrders() != null ? agent.getCurrentActiveOrders() : 0;
        int maxCapacity = agent.getMaxActiveOrders() != null ? agent.getMaxActiveOrders() : 5;
        return activeOrders < maxCapacity;
    }

    @Override
    public boolean isAgentEligibleForOrder(DeliveryAgent agent, Order order) {
        return isAgentEligible(agent);
    }

    @Override
    public void validateAgentEligibility(DeliveryAgent agent) {
        if (agent == null) {
            throw new BusinessRuleException("AGENT_NOT_ELIGIBLE: Delivery agent not found.");
        }
        if (!Boolean.TRUE.equals(agent.getActive())) {
            throw new BusinessRuleException("AGENT_NOT_ELIGIBLE: Delivery agent account is inactive.");
        }
        if (!Boolean.TRUE.equals(agent.getIsAvailable())) {
            throw new BusinessRuleException("AGENT_NOT_ELIGIBLE: Delivery agent is currently marked unavailable (offline).");
        }
        int activeOrders = agent.getCurrentActiveOrders() != null ? agent.getCurrentActiveOrders() : 0;
        int maxCapacity = agent.getMaxActiveOrders() != null ? agent.getMaxActiveOrders() : 5;
        if (activeOrders >= maxCapacity) {
            throw new BusinessRuleException(String.format("AGENT_NOT_ELIGIBLE: Delivery agent has reached maximum concurrency quota (%d/%d active tasks).",
                    activeOrders, maxCapacity));
        }
    }

    @Override
    public List<DeliveryAgent> filterEligibleAgents(List<DeliveryAgent> candidateAgents, Order order) {
        if (candidateAgents == null) return List.of();
        return candidateAgents.stream()
                .filter(agent -> isAgentEligibleForOrder(agent, order))
                .toList();
    }
}
