package com.gatiman.repository;

import com.gatiman.entity.TrackingEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TrackingEventRepository extends JpaRepository<TrackingEvent, Long> {
    List<TrackingEvent> findByOrderIdOrderByEventTimestampAsc(Long orderId);
}
