package com.gatiman.repository;

import com.gatiman.entity.DeliveryAgent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryAgentRepository extends JpaRepository<DeliveryAgent, Long> {
    Optional<DeliveryAgent> findByUserId(Long userId);
    List<DeliveryAgent> findByIsAvailableTrue();
    long countByIsAvailableTrue();
    List<DeliveryAgent> findByIsAvailableTrueAndStatus(String status);
    List<DeliveryAgent> findByAssignedZoneId(Long zoneId);
}
