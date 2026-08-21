package com.gatiman.repository;

import com.gatiman.entity.EmailLog;
import com.gatiman.enums.EmailEventType;
import com.gatiman.enums.EmailStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmailLogRepository extends JpaRepository<EmailLog, Long> {

    List<EmailLog> findByOrderIdOrderByCreatedAtDesc(Long orderId);

    List<EmailLog> findByTrackingNumberOrderByCreatedAtDesc(String trackingNumber);

    List<EmailLog> findByRecipientEmailOrderByCreatedAtDesc(String recipientEmail);

    boolean existsByIdempotencyKeyAndStatusIn(String idempotencyKey, List<EmailStatus> statuses);

    Optional<EmailLog> findByIdempotencyKey(String idempotencyKey);

    Page<EmailLog> findByStatus(EmailStatus status, Pageable pageable);

    Page<EmailLog> findByEventType(EmailEventType eventType, Pageable pageable);

    @Query("SELECT e FROM EmailLog e WHERE " +
           "(:status IS NULL OR e.status = :status) AND " +
           "(:eventType IS NULL OR e.eventType = :eventType) AND " +
           "(:searchTerm IS NULL OR LOWER(e.trackingNumber) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           " LOWER(e.recipientEmail) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           " LOWER(e.subject) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<EmailLog> searchLogs(
            @Param("status") EmailStatus status,
            @Param("eventType") EmailEventType eventType,
            @Param("searchTerm") String searchTerm,
            Pageable pageable
    );

    long countByStatus(EmailStatus status);

    long countByEventType(EmailEventType eventType);

    @Query("SELECT e FROM EmailLog e WHERE e.status = 'FAILED' AND e.retryCount < :maxRetries ORDER BY e.createdAt ASC")
    List<EmailLog> findFailedForRetry(@Param("maxRetries") int maxRetries);

    @Query("SELECT e FROM EmailLog e WHERE e.orderId = :orderId AND e.eventType = :eventType AND e.createdAt > :after")
    List<EmailLog> findRecentByOrderAndType(
            @Param("orderId") Long orderId,
            @Param("eventType") EmailEventType eventType,
            @Param("after") Instant after
    );
}
