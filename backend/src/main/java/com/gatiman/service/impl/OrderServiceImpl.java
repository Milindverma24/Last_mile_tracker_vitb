package com.gatiman.service.impl;

import com.gatiman.dto.order.*;
import com.gatiman.entity.*;
import com.gatiman.enums.*;
import com.gatiman.exception.BusinessRuleException;
import com.gatiman.exception.ResourceNotFoundException;
import com.gatiman.repository.*;
import com.gatiman.service.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final DeliveryAgentRepository deliveryAgentRepository;
    private final ZoneRepository zoneRepository;
    private final AreaRepository areaRepository;
    private final RateCardRepository rateCardRepository;
    private final TrackingService trackingService;
    private final NotificationService notificationService;
    private final PricingService pricingService;
    private final OrderStatusTransitionService statusTransitionService;
    private final AgentAssignmentService agentAssignmentService;

    @Override
    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request, User currentUser) {
        log.info("Processing authoritative order creation for user: {}", currentUser.getEmail());

        // 1. Resolve or Create Customer Profile
        Customer customer = customerRepository.findByUserId(currentUser.getId())
                .orElseGet(() -> {
                    log.info("Provisioning customer profile for user: {}", currentUser.getEmail());
                    return customerRepository.save(Customer.builder()
                            .user(currentUser)
                            .customerType(request.getCustomerType() != null ? request.getCustomerType() : CustomerType.B2C)
                            .defaultPickupAddress(request.getPickupAddress())
                            .defaultPickupPincode(request.getPickupPincode())
                            .build());
                });

        // 2. Authoritative Price Calculation
        ChargeCalculationRequest calcReq = ChargeCalculationRequest.builder()
                .customerType(request.getCustomerType() != null ? request.getCustomerType() : CustomerType.B2C)
                .paymentType(request.getPaymentType() != null ? request.getPaymentType() : PaymentType.PREPAID)
                .pickupPincode(request.getPickupPincode())
                .dropPincode(request.getDropPincode())
                .lengthCm(request.getLengthCm())
                .breadthCm(request.getBreadthCm())
                .heightCm(request.getHeightCm())
                .actualWeightKg(request.getActualWeightKg())
                .build();

        ChargeCalculationResponse charges = pricingService.calculateCharge(calcReq);

        // 3. Resolve Zone Entities
        Zone pickupZone = zoneRepository.findById(charges.getPickupZoneId())
                .orElseThrow(() -> new BusinessRuleException("ZONE_NOT_FOUND: Pickup zone not found"));
        Zone dropZone = zoneRepository.findById(charges.getDropZoneId())
                .orElseThrow(() -> new BusinessRuleException("ZONE_NOT_FOUND: Drop zone not found"));

        Area pickupArea = charges.getPickupAreaId() != null ? areaRepository.findById(charges.getPickupAreaId()).orElse(null) : null;
        Area dropArea = charges.getDropAreaId() != null ? areaRepository.findById(charges.getDropAreaId()).orElse(null) : null;

        RateCard rateCard = rateCardRepository.findById(charges.getRateCardId())
                .orElseThrow(() -> new BusinessRuleException("NO_ACTIVE_RATE_CARD: Rate card not found"));

        // 4. Generate Unique Human-Readable Order Tracking Number
        String trackingNumber = generateUniqueTrackingNumber();

        // 5. Persist Order Entity
        Order order = Order.builder()
                .trackingNumber(trackingNumber)
                .orderNumber(trackingNumber)
                .customer(customer)
                .customerType(charges.getCustomerType())
                .paymentType(charges.getPaymentType())
                .status(OrderStatus.CREATED)
                .pickupName(request.getPickupName())
                .pickupPhone(request.getPickupPhone())
                .pickupAddress(request.getPickupAddress())
                .pickupPincode(request.getPickupPincode())
                .pickupArea(pickupArea)
                .pickupZone(pickupZone)
                .dropName(request.getDropName())
                .dropPhone(request.getDropPhone())
                .dropAddress(request.getDropAddress())
                .dropPincode(request.getDropPincode())
                .dropArea(dropArea)
                .dropZone(dropZone)
                .routeType(charges.getRouteType())
                .actualWeightKg(charges.getActualWeightKg())
                .volumetricWeightKg(charges.getVolumetricWeightKg())
                .billableWeightKg(charges.getBillableWeightKg())
                .baseCharge(charges.getBaseCharge())
                .codSurcharge(charges.getCodSurcharge())
                .totalCharge(charges.getTotalCharge())
                .rateCard(rateCard)
                .scheduledDeliveryDate(LocalDate.now().plusDays(1))
                .rescheduleCount(0)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        // 6. Attach Package Specifications
        OrderPackage pkg = OrderPackage.builder()
                .order(order)
                .packageDescription(request.getPackageDescription() != null ? request.getPackageDescription() : "Standard Parcel")
                .lengthCm(request.getLengthCm())
                .breadthCm(request.getBreadthCm())
                .heightCm(request.getHeightCm())
                .declaredValue(request.getDeclaredValue() != null ? request.getDeclaredValue() : BigDecimal.ZERO)
                .build();
        order.setPackages(List.of(pkg));

        Order savedOrder = orderRepository.save(order);

        // 7. Append Initial Immutable Tracking Event
        trackingService.recordEvent(
                savedOrder,
                null,
                OrderStatus.CREATED,
                currentUser,
                currentUser.getFirstName() + " " + currentUser.getLastName(),
                currentUser.getRole().name(),
                "Order created and registered with GATIMAN network",
                null,
                null
        );

        // 8. Dispatch In-App Notification
        notificationService.createNotification(
                currentUser,
                savedOrder,
                "ORDER_CREATED",
                "Booking Confirmed — " + trackingNumber,
                String.format("Your shipment of ₹%s is confirmed. Tracking ID: %s.",
                        charges.getTotalCharge().toPlainString(), trackingNumber)
        );

        log.info("Order successfully created with ID {} and Tracking Number {}", savedOrder.getId(), trackingNumber);
        return mapToOrderResponse(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id, User currentUser) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ORDER_NOT_FOUND: Order not found with ID: " + id));

        // Customer Data Security: verify ownership if caller is customer
        if (currentUser != null && currentUser.getRole() == Role.CUSTOMER) {
            if (order.getCustomer() == null || !order.getCustomer().getUser().getId().equals(currentUser.getId())) {
                throw new BusinessRuleException("UNAUTHORIZED_ORDER_ACCESS: You do not have permission to view this order.");
            }
        }

        return mapToOrderResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderByTrackingNumber(String trackingNumber) {
        Order order = orderRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new ResourceNotFoundException("ORDER_NOT_FOUND: Order not found with tracking number: " + trackingNumber));
        return mapToOrderResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersForCustomer(User customerUser) {
        Customer customer = customerRepository.findByUserId(customerUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("CUSTOMER_NOT_FOUND: Customer profile not found"));
        return orderRepository.findByCustomerIdOrderByCreatedAtDesc(customer.getId())
                .stream().map(this::mapToOrderResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> getAllOrders(Pageable pageable, String statusFilter, Long zoneFilter) {
        if (statusFilter != null && !statusFilter.equalsIgnoreCase("ALL")) {
            OrderStatus status = OrderStatus.valueOf(statusFilter.toUpperCase());
            return orderRepository.findByStatus(status, pageable).map(this::mapToOrderResponse);
        }
        return orderRepository.findAll(pageable).map(this::mapToOrderResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersForAgent(User agentUser) {
        DeliveryAgent agent = deliveryAgentRepository.findByUserId(agentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("AGENT_NOT_FOUND: Agent profile not found"));
        return orderRepository.findByAssignedAgentIdOrderByCreatedAtDesc(agent.getId())
                .stream().map(this::mapToOrderResponse).toList();
    }

    @Override
    @Transactional
    public OrderResponse autoAssignOrder(Long orderId) {
        agentAssignmentService.autoAssign(orderId);
        Order updated = orderRepository.findById(orderId).orElseThrow();
        return mapToOrderResponse(updated);
    }

    @Override
    @Transactional
    public OrderResponse manualAssignOrder(Long orderId, Long agentId, User assignedBy) {
        agentAssignmentService.manualAssign(orderId, agentId, assignedBy);
        Order updated = orderRepository.findById(orderId).orElseThrow();
        return mapToOrderResponse(updated);
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, OrderStatus nextStatus, User actorUser, String remarks, Double lat, Double lng) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("ORDER_NOT_FOUND: Order not found with ID: " + orderId));

        OrderStatus currentStatus = order.getStatus();

        // Validate FSM lifecycle transition
        statusTransitionService.validateTransition(currentStatus, nextStatus);

        order.setStatus(nextStatus);
        order.setUpdatedAt(Instant.now());

        // Manage agent active load when transitioning to terminal states
        if (nextStatus == OrderStatus.DELIVERED || nextStatus == OrderStatus.FAILED || nextStatus == OrderStatus.CANCELLED) {
            DeliveryAgent agent = order.getAssignedAgent();
            if (agent != null && agent.getCurrentActiveOrders() != null && agent.getCurrentActiveOrders() > 0) {
                agent.setCurrentActiveOrders(agent.getCurrentActiveOrders() - 1);
                deliveryAgentRepository.save(agent);
            }
        }

        Order updatedOrder = orderRepository.save(order);

        // Record Immutable Tracking Event
        String actorName = actorUser != null ? actorUser.getFirstName() + " " + actorUser.getLastName() : "System";
        String actorRole = actorUser != null ? actorUser.getRole().name() : "SYSTEM";
        String note = remarks != null ? remarks : "Status updated to " + nextStatus;

        trackingService.recordEvent(
                updatedOrder,
                currentStatus,
                nextStatus,
                actorUser,
                actorName,
                actorRole,
                note,
                lat,
                lng
        );

        // Dispatch Notification on Milestone
        if (order.getCustomer() != null && order.getCustomer().getUser() != null) {
            notificationService.createNotification(
                    order.getCustomer().getUser(),
                    updatedOrder,
                    nextStatus.name(),
                    "Delivery Update: " + nextStatus.name() + " — " + order.getTrackingNumber(),
                    note
            );
        }

        return mapToOrderResponse(updatedOrder);
    }

    @Override
    @Transactional
    public OrderResponse markDeliveryFailed(Long orderId, User agentUser, FailureReason reason, String notes, Double lat, Double lng) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("ORDER_NOT_FOUND: Order not found with ID: " + orderId));

        statusTransitionService.validateTransition(order.getStatus(), OrderStatus.FAILED);

        order.setStatus(OrderStatus.FAILED);
        order.setUpdatedAt(Instant.now());

        DeliveryAgent agent = order.getAssignedAgent();
        if (agent != null && agent.getCurrentActiveOrders() != null && agent.getCurrentActiveOrders() > 0) {
            agent.setCurrentActiveOrders(agent.getCurrentActiveOrders() - 1);
            deliveryAgentRepository.save(agent);
        }

        Order saved = orderRepository.save(order);

        String failureText = reason != null ? reason.name() : "DELIVERY_ATTEMPT_FAILED";
        String remarks = "Delivery attempt failed. Reason: " + failureText + (notes != null ? " (" + notes + ")" : "");
        trackingService.recordEvent(
                saved,
                OrderStatus.OUT_FOR_DELIVERY,
                OrderStatus.FAILED,
                agentUser,
                agentUser != null ? agentUser.getFirstName() + " " + agentUser.getLastName() : "Driver Partner",
                "DELIVERY_AGENT",
                remarks,
                lat,
                lng
        );

        if (order.getCustomer() != null && order.getCustomer().getUser() != null) {
            notificationService.createNotification(
                    order.getCustomer().getUser(),
                    saved,
                    "DELIVERY_FAILED",
                    "Delivery Attempt Failed — " + order.getTrackingNumber(),
                    "Our agent was unable to deliver your package. Reason: " + failureText + ". Please reschedule your delivery slot."
            );
        }

        return mapToOrderResponse(saved);
    }

    @Override
    @Transactional
    public OrderResponse rescheduleDelivery(Long orderId, User customerUser, LocalDate requestedDate, String preferredSlot, String notes) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("ORDER_NOT_FOUND: Order not found with ID: " + orderId));

        statusTransitionService.validateTransition(order.getStatus(), OrderStatus.RESCHEDULED);

        order.setStatus(OrderStatus.RESCHEDULED);
        order.setScheduledDeliveryDate(requestedDate);
        order.setRescheduleCount(order.getRescheduleCount() + 1);
        order.setUpdatedAt(Instant.now());

        Order saved = orderRepository.save(order);

        trackingService.recordEvent(
                saved,
                OrderStatus.FAILED,
                OrderStatus.RESCHEDULED,
                customerUser,
                customerUser != null ? customerUser.getFirstName() + " " + customerUser.getLastName() : "Customer",
                "CUSTOMER",
                "Shipment rescheduled for " + requestedDate + " (" + preferredSlot + ")",
                null,
                null
        );

        // Auto-assign to available agent
        try {
            agentAssignmentService.autoAssign(saved.getId());
        } catch (Exception e) {
            log.warn("Auto-assignment postponed after rescheduling for order {}: {}", saved.getTrackingNumber(), e.getMessage());
        }

        return mapToOrderResponse(saved);
    }

    private String generateUniqueTrackingNumber() {
        String datePrefix = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int randomNum = 100000 + new Random().nextInt(900000);
        return String.format("GTM-%s-%d", datePrefix, randomNum);
    }

    private OrderResponse mapToOrderResponse(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .trackingNumber(order.getTrackingNumber())
                .orderNumber(order.getOrderNumber())
                .customerId(order.getCustomer() != null ? order.getCustomer().getId() : null)
                .customerName(order.getCustomer() != null && order.getCustomer().getUser() != null ?
                        order.getCustomer().getUser().getFirstName() + " " + order.getCustomer().getUser().getLastName() : "Valued Customer")
                .customerEmail(order.getCustomer() != null && order.getCustomer().getUser() != null ?
                        order.getCustomer().getUser().getEmail() : "")
                .customerType(order.getCustomerType())
                .paymentType(order.getPaymentType())
                .paymentStatus(order.getPaymentStatus() != null ? order.getPaymentStatus() : PaymentStatus.PENDING)
                .razorpayOrderId(order.getRazorpayOrderId())
                .razorpayPaymentId(order.getRazorpayPaymentId())
                .status(order.getStatus())
                .pickupName(order.getPickupName())
                .pickupPhone(order.getPickupPhone())
                .pickupAddress(order.getPickupAddress())
                .pickupPincode(order.getPickupPincode())
                .pickupZoneName(order.getPickupZone() != null ? order.getPickupZone().getName() : null)
                .dropName(order.getDropName())
                .dropPhone(order.getDropPhone())
                .dropAddress(order.getDropAddress())
                .dropPincode(order.getDropPincode())
                .dropZoneName(order.getDropZone() != null ? order.getDropZone().getName() : null)
                .routeType(order.getRouteType())
                .actualWeightKg(order.getActualWeightKg())
                .volumetricWeightKg(order.getVolumetricWeightKg())
                .billableWeightKg(order.getBillableWeightKg())
                .baseCharge(order.getBaseCharge())
                .codSurcharge(order.getCodSurcharge())
                .totalCharge(order.getTotalCharge())
                .assignedAgentId(order.getAssignedAgent() != null ? order.getAssignedAgent().getId() : null)
                .assignedAgentName(order.getAssignedAgent() != null ? order.getAssignedAgent().getName() : null)
                .assignedAgentPhone(order.getAssignedAgent() != null ? order.getAssignedAgent().getPhoneNumber() : null)
                .assignedAgentVehicle(order.getAssignedAgent() != null ? order.getAssignedAgent().getVehicleNumber() : null)
                .scheduledDeliveryDate(order.getScheduledDeliveryDate())
                .rescheduleCount(order.getRescheduleCount())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
