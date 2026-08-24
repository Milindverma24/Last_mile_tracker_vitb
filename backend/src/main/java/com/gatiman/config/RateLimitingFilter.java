package com.gatiman.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gatiman.dto.common.ErrorResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
@Slf4j
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final int AUTH_LIMIT_PER_MINUTE = 60; // 60 login/register attempts per IP per minute
    private static final int GENERAL_LIMIT_PER_MINUTE = 300; // 300 API requests per IP per minute

    private final Map<String, ClientRateRecord> clientBuckets = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static class ClientRateRecord {
        long windowStartTimestamp;
        AtomicInteger requestCount;

        ClientRateRecord(long windowStart) {
            this.windowStartTimestamp = windowStart;
            this.requestCount = new AtomicInteger(1);
        }
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String uri = request.getRequestURI();

        // Skip rate limiting for static assets, swagger, health check, and dev consoles
        if (uri.startsWith("/actuator") || uri.startsWith("/swagger") || uri.startsWith("/v3/api-docs") || uri.startsWith("/h2-console")) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = getClientIP(request);
        boolean isLocalhost = "127.0.0.1".equals(clientIp) || "0:0:0:0:0:0:0:1".equals(clientIp) || "::1".equals(clientIp);
        boolean isAuthEndpoint = uri.startsWith("/api/auth/login") || uri.startsWith("/api/auth/register");
        int maxAllowed = isLocalhost ? 5000 : (isAuthEndpoint ? AUTH_LIMIT_PER_MINUTE : GENERAL_LIMIT_PER_MINUTE);

        String bucketKey = clientIp + ":" + (isAuthEndpoint ? "AUTH" : "GEN");
        long currentMinute = System.currentTimeMillis() / 60000;

        ClientRateRecord record = clientBuckets.compute(bucketKey, (k, v) -> {
            if (v == null || v.windowStartTimestamp != currentMinute) {
                return new ClientRateRecord(currentMinute);
            }
            v.requestCount.incrementAndGet();
            return v;
        });

        if (record.requestCount.get() > maxAllowed) {
            log.warn("Rate limit exceeded for client IP {} on URI {}", clientIp, uri);
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setHeader("Retry-After", "60");

            ErrorResponse error = ErrorResponse.builder()
                    .success(false)
                    .message("Rate limit exceeded. Please wait a moment before sending more requests.")
                    .errorCode("TOO_MANY_REQUESTS")
                    .timestamp(Instant.now())
                    .build();

            response.getWriter().write(objectMapper.writeValueAsString(error));
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty()) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }
}
