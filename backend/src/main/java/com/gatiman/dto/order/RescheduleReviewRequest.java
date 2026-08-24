package com.gatiman.dto.order;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RescheduleReviewRequest {
    private String rejectionReason;
    private Long overrideAgentId;
}
