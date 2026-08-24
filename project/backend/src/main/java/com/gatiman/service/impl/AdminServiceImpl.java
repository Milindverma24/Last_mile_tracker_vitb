package com.gatiman.service.impl;

import com.gatiman.dto.admin.DashboardResponse;
import com.gatiman.entity.DeliveryAgent;
import com.gatiman.entity.Order;
import com.gatiman.enums.CustomerType;
import com.gatiman.enums.OrderStatus;
import com.gatiman.repository.DeliveryAgentRepository;
import com.gatiman.repository.OrderRepository;
import com.gatiman.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminServiceImpl implements AdminService {

    private final OrderRepository orderRepository;
    private final DeliveryAgentRepository deliveryAgentRepository;

    @Override
    public DashboardResponse getDashboardAnalytics() {
        List<Order> orders = orderRepository.findAll();
        List<DeliveryAgent> agents = deliveryAgentRepository.findAll();

        BigDecimal totalRevenue = orders.stream()
                .map(Order::getTotalCharge)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long pendingCount = orders.stream().filter(o -> o.getStatus() == OrderStatus.CREATED).count();
        long assignedCount = orders.stream().filter(o -> o.getStatus() == OrderStatus.ASSIGNED).count();
        long inTransitCount = orders.stream().filter(o -> o.getStatus() == OrderStatus.IN_TRANSIT || o.getStatus() == OrderStatus.PICKED_UP).count();
        long outForDeliveryCount = orders.stream().filter(o -> o.getStatus() == OrderStatus.OUT_FOR_DELIVERY).count();
        long deliveredCount = orders.stream().filter(o -> o.getStatus() == OrderStatus.DELIVERED).count();
        long failedCount = orders.stream().filter(o -> o.getStatus() == OrderStatus.FAILED).count();

        long availableAgents = agents.stream().filter(DeliveryAgent::getIsAvailable).count();

        long b2cCount = orders.stream().filter(o -> o.getCustomerType() == CustomerType.B2C).count();
        long b2bCount = orders.stream().filter(o -> o.getCustomerType() == CustomerType.B2B).count();

        Map<String, Long> ordersByStatus = new HashMap<>();
        for (OrderStatus st : OrderStatus.values()) {
            ordersByStatus.put(st.name(), orders.stream().filter(o -> o.getStatus() == st).count());
        }

        Map<String, Long> ordersByZone = new HashMap<>();
        for (Order o : orders) {
            if (o.getPickupZone() != null) {
                ordersByZone.merge(o.getPickupZone().getName(), 1L, Long::sum);
            }
        }

        return DashboardResponse.builder()
                .totalOrders((long) orders.size())
                .pendingOrders(pendingCount)
                .assignedOrders(assignedCount)
                .inTransitOrders(inTransitCount)
                .outForDelivery(outForDeliveryCount)
                .deliveredOrders(deliveredCount)
                .failedOrders(failedCount)
                .availableAgents(availableAgents)
                .totalAgents((long) agents.size())
                .totalRevenue(totalRevenue)
                .b2cCount(b2cCount)
                .b2bCount(b2bCount)
                .ordersByStatus(ordersByStatus)
                .ordersByZone(ordersByZone)
                .build();
    }
}
