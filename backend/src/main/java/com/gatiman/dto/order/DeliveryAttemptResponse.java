package com.gatiman.dto.order;

import com.gatiman.enums.FailureReason;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryAttemptResponse {
    private Long id;
    private Long orderId;
    private Integer attemptNumber;
    private Long agentId;
    private String agentName;
    private String status;
    private FailureReason failureReason;
    private String failureNotes;
    private LocalDate scheduledDate;
    private Instant attemptedAt;
    private Instant startedAt;
    private Instant completedAt;
}
