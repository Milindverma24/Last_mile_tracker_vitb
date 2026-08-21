package com.gatiman.repository;

import com.gatiman.entity.DeliveryAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryAttemptRepository extends JpaRepository<DeliveryAttempt, Long> {
    List<DeliveryAttempt> findByOrderIdOrderByAttemptNumberAsc(Long orderId);
    Optional<DeliveryAttempt> findTopByOrderIdOrderByAttemptNumberDesc(Long orderId);
    List<DeliveryAttempt> findByAgentId(Long agentId);
    Long countByStatus(String status);
}
