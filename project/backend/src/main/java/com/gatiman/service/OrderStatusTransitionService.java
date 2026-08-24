package com.gatiman.service;

import com.gatiman.enums.OrderStatus;

public interface OrderStatusTransitionService {
    boolean isValidTransition(OrderStatus currentStatus, OrderStatus newStatus);
    void validateTransition(OrderStatus currentStatus, OrderStatus newStatus);
}
