package com.gatiman.dto.order;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RescheduleRequestDto {
    @NotNull(message = "Requested delivery date is required")
    @FutureOrPresent(message = "Requested delivery date cannot be in the past")
    private LocalDate requestedDate;

    private String preferredTimeSlot;
    private String reason;
    private String rescheduleNotes;
}
