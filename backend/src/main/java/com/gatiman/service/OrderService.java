package com.gatiman.service;

import com.gatiman.dto.order.CreateOrderRequest;
import com.gatiman.dto.order.OrderResponse;
import com.gatiman.dto.order.OrderSummaryResponse;
import com.gatiman.entity.User;
import com.gatiman.enums.FailureReason;
import com.gatiman.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

public interface OrderService {
    OrderResponse createOrder(CreateOrderRequest request, User currentUser);
    OrderResponse getOrderById(Long id, User currentUser);
    OrderResponse getOrderByTrackingNumber(String trackingNumber);
    List<OrderResponse> getOrdersForCustomer(User customer);
    Page<OrderResponse> getAllOrders(Pageable pageable, String statusFilter, Long zoneFilter);
    List<OrderResponse> getOrdersForAgent(User agentUser);

    OrderResponse autoAssignOrder(Long orderId);
    OrderResponse manualAssignOrder(Long orderId, Long agentId, User assignedBy);
    OrderResponse updateOrderStatus(Long orderId, OrderStatus nextStatus, User actorUser, String remarks, Double lat, Double lng);
    OrderResponse markDeliveryFailed(Long orderId, User agentUser, FailureReason reason, String notes, Double lat, Double lng);
    OrderResponse rescheduleDelivery(Long orderId, User customerUser, LocalDate requestedDate, String preferredSlot, String notes);
}
