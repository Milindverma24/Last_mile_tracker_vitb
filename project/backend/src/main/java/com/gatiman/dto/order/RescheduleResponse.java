package com.gatiman.dto.order;

import com.gatiman.enums.RescheduleStatus;
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
public class RescheduleResponse {
    private Long id;
    private Long orderId;
    private String trackingNumber;
    private String customerName;
    private String pickupAddress;
    private String dropAddress;
    private String dropZoneName;
    private LocalDate requestedDate;
    private String preferredTimeSlot;
    private String reason;
    private String rescheduleNotes;
    private RescheduleStatus status;
    private Long requestedByUserId;
    private String requestedByName;
    private Long reviewedByUserId;
    private String reviewedByName;
    private String rejectionReason;
    private Instant requestedAt;
    private Instant reviewedAt;
}
