package com.gatiman.exception;

import com.gatiman.enums.OrderStatus;

public class InvalidStatusTransitionException extends RuntimeException {
    public InvalidStatusTransitionException(String message) {
        super(message);
    }

    public InvalidStatusTransitionException(OrderStatus currentStatus, OrderStatus newStatus) {
        super(String.format("INVALID_STATUS_TRANSITION: Cannot transition order status from '%s' to '%s'.",
                currentStatus, newStatus));
    }
}
