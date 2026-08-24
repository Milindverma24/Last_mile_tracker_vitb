package com.gatiman.dto.common;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {
    @Builder.Default
    private Boolean success = false;
    private String message;
    private String errorCode;
    private List<String> errors;
    @Builder.Default
    private Instant timestamp = Instant.now();
}
