package com.gatiman.repository;

import com.gatiman.entity.OrderAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderAssignmentRepository extends JpaRepository<OrderAssignment, Long> {
    List<OrderAssignment> findByOrderId(Long orderId);
    List<OrderAssignment> findByOrderIdOrderByAssignedAtDesc(Long orderId);
    List<OrderAssignment> findByAgentIdAndStatus(Long agentId, String status);
}
