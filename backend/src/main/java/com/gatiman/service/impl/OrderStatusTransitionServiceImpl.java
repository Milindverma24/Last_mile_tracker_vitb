package com.gatiman.service.impl;

import com.gatiman.enums.OrderStatus;
import com.gatiman.exception.InvalidStatusTransitionException;
import com.gatiman.service.OrderStatusTransitionService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

@Service
@Slf4j
public class OrderStatusTransitionServiceImpl implements OrderStatusTransitionService {

    private static final Map<OrderStatus, Set<OrderStatus>> ALLOWED_TRANSITIONS;

    static {
        Map<OrderStatus, Set<OrderStatus>> map = new EnumMap<>(OrderStatus.class);

        // CREATED -> ASSIGNED, CANCELLED
        map.put(OrderStatus.CREATED, EnumSet.of(OrderStatus.ASSIGNED, OrderStatus.CANCELLED));

        // ASSIGNED -> PICKED_UP, OUT_FOR_DELIVERY, CANCELLED
        map.put(OrderStatus.ASSIGNED, EnumSet.of(OrderStatus.PICKED_UP, OrderStatus.OUT_FOR_DELIVERY, OrderStatus.CANCELLED));

        // PICKED_UP -> IN_TRANSIT
        map.put(OrderStatus.PICKED_UP, EnumSet.of(OrderStatus.IN_TRANSIT));

        // IN_TRANSIT -> OUT_FOR_DELIVERY
        map.put(OrderStatus.IN_TRANSIT, EnumSet.of(OrderStatus.OUT_FOR_DELIVERY));

        // OUT_FOR_DELIVERY -> DELIVERED, FAILED
        map.put(OrderStatus.OUT_FOR_DELIVERY, EnumSet.of(OrderStatus.DELIVERED, OrderStatus.FAILED));

        // FAILED -> RESCHEDULED
        map.put(OrderStatus.FAILED, EnumSet.of(OrderStatus.RESCHEDULED));

        // RESCHEDULED -> ASSIGNED
        map.put(OrderStatus.RESCHEDULED, EnumSet.of(OrderStatus.ASSIGNED));

        // Terminal states
        map.put(OrderStatus.DELIVERED, Collections.emptySet());
        map.put(OrderStatus.CANCELLED, Collections.emptySet());

        ALLOWED_TRANSITIONS = Collections.unmodifiableMap(map);
    }

    @Override
    public boolean isValidTransition(OrderStatus currentStatus, OrderStatus newStatus) {
        if (currentStatus == null || newStatus == null) {
            return false;
        }
        if (currentStatus == newStatus) {
            return true;
        }
        Set<OrderStatus> allowed = ALLOWED_TRANSITIONS.get(currentStatus);
        return allowed != null && allowed.contains(newStatus);
    }

    @Override
    public void validateTransition(OrderStatus currentStatus, OrderStatus newStatus) {
        if (!isValidTransition(currentStatus, newStatus)) {
            log.warn("Illegal order status transition rejected: {} -> {}", currentStatus, newStatus);
            throw new InvalidStatusTransitionException(currentStatus, newStatus);
        }
    }
}
