package com.gatiman.repository;

import com.gatiman.entity.Order;
import com.gatiman.enums.OrderStatus;
import com.gatiman.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByTrackingNumber(String trackingNumber);
    Optional<Order> findByOrderNumber(String orderNumber);
    List<Order> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    Page<Order> findByCustomerId(Long customerId, Pageable pageable);
    Page<Order> findByCustomerIdOrderByCreatedAtDesc(Long customerId, Pageable pageable);
    List<Order> findByAssignedAgentIdOrderByCreatedAtDesc(Long agentId);
    Page<Order> findByAssignedAgentId(Long agentId, Pageable pageable);
    List<Order> findByStatus(OrderStatus status);
    Page<Order> findByStatus(OrderStatus status, Pageable pageable);
    Long countByStatus(OrderStatus status);
    long countByStatusIn(List<OrderStatus> statuses);
    long countByCustomerId(Long customerId);
    List<Order> findByStatusIn(List<OrderStatus> statuses);

    @Modifying
    @Query("UPDATE Order o SET o.razorpayOrderId = :razorpayOrderId WHERE o.id = :orderId")
    void updateRazorpayOrderId(@Param("orderId") Long orderId, @Param("razorpayOrderId") String razorpayOrderId);

    @Modifying
    @Query("UPDATE Order o SET o.paymentStatus = :status, o.razorpayPaymentId = :paymentId, o.razorpaySignature = :signature, o.updatedAt = :now WHERE o.id = :orderId")
    void updatePaymentDetails(@Param("orderId") Long orderId, @Param("status") PaymentStatus status, @Param("paymentId") String paymentId, @Param("signature") String signature, @Param("now") Instant now);
}
