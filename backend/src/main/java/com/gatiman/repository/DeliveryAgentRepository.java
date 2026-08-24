package com.gatiman.repository;

import com.gatiman.entity.DeliveryAgent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    @Modifying
    @Query("UPDATE DeliveryAgent a SET a.currentActiveOrders = a.currentActiveOrders + 1 WHERE a.id = :id")
    void incrementActiveOrders(@Param("id") Long id);

    @Modifying
    @Query("UPDATE DeliveryAgent a SET a.currentActiveOrders = CASE WHEN a.currentActiveOrders > 0 THEN a.currentActiveOrders - 1 ELSE 0 END WHERE a.id = :id")
    void decrementActiveOrders(@Param("id") Long id);
}
