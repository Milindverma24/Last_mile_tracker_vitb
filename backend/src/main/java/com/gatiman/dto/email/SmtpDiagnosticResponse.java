package com.gatiman.dto.email;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SmtpDiagnosticResponse {
    private boolean overallHealthy;
    private String host;
    private int port;
    private String protocol;
    private boolean dnsResolved;
    private String resolvedIp;
    private boolean tcpConnected;
    private long tcpLatencyMs;
    private boolean tlsSslHandshakeSuccess;
    private String cipherSuite;
    private boolean authSuccess;
    private String maskedUsername;
    private boolean passwordConfigured;
    private String statusMessage;
    private String diagnosticDetails;
    private String recommendation;
    private Instant timestamp;
    private Map<String, Object> environmentFlags;
}
