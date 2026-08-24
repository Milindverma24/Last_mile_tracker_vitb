package com.gatiman;

import com.gatiman.enums.OrderStatus;
import com.gatiman.exception.InvalidStatusTransitionException;
import com.gatiman.service.OrderStatusTransitionService;
import com.gatiman.service.impl.OrderStatusTransitionServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class OrderStatusTransitionServiceTest {

    private OrderStatusTransitionService transitionService;

    @BeforeEach
    void setUp() {
        transitionService = new OrderStatusTransitionServiceImpl();
    }

    @Test
    @DisplayName("Verify valid progression lifecycle sequence")
    void testValidLifecycleProgression() {
        assertTrue(transitionService.isValidTransition(OrderStatus.CREATED, OrderStatus.ASSIGNED));
        assertTrue(transitionService.isValidTransition(OrderStatus.ASSIGNED, OrderStatus.PICKED_UP));
        assertTrue(transitionService.isValidTransition(OrderStatus.PICKED_UP, OrderStatus.IN_TRANSIT));
        assertTrue(transitionService.isValidTransition(OrderStatus.IN_TRANSIT, OrderStatus.OUT_FOR_DELIVERY));
        assertTrue(transitionService.isValidTransition(OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED));
        assertTrue(transitionService.isValidTransition(OrderStatus.OUT_FOR_DELIVERY, OrderStatus.FAILED));
        assertTrue(transitionService.isValidTransition(OrderStatus.FAILED, OrderStatus.RESCHEDULED));
        assertTrue(transitionService.isValidTransition(OrderStatus.RESCHEDULED, OrderStatus.ASSIGNED));
    }

    @Test
    @DisplayName("Reject invalid and skipping transitions with InvalidStatusTransitionException")
    void testRejectInvalidTransitions() {
        assertFalse(transitionService.isValidTransition(OrderStatus.CREATED, OrderStatus.DELIVERED));
        assertFalse(transitionService.isValidTransition(OrderStatus.CREATED, OrderStatus.IN_TRANSIT));
        assertFalse(transitionService.isValidTransition(OrderStatus.DELIVERED, OrderStatus.IN_TRANSIT));
        assertFalse(transitionService.isValidTransition(OrderStatus.DELIVERED, OrderStatus.FAILED));
        assertFalse(transitionService.isValidTransition(OrderStatus.FAILED, OrderStatus.DELIVERED));

        assertThrows(InvalidStatusTransitionException.class, () ->
                transitionService.validateTransition(OrderStatus.CREATED, OrderStatus.DELIVERED));

        assertThrows(InvalidStatusTransitionException.class, () ->
                transitionService.validateTransition(OrderStatus.DELIVERED, OrderStatus.IN_TRANSIT));
    }
}
