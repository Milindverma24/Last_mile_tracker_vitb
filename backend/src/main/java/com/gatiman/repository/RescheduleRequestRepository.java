package com.gatiman.repository;

import com.gatiman.entity.RescheduleRequest;
import com.gatiman.enums.RescheduleStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RescheduleRequestRepository extends JpaRepository<RescheduleRequest, Long> {
    List<RescheduleRequest> findByOrderIdOrderByCreatedAtDesc(Long orderId);
    Optional<RescheduleRequest> findFirstByOrderIdAndStatus(Long orderId, RescheduleStatus status);
    List<RescheduleRequest> findByStatus(RescheduleStatus status);
    Page<RescheduleRequest> findByStatus(RescheduleStatus status, Pageable pageable);
    Page<RescheduleRequest> findAllByOrderByCreatedAtDesc(Pageable pageable);
    Long countByStatus(RescheduleStatus status);
}
