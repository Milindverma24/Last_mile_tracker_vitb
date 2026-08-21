package com.gatiman.dto.profile;

import com.gatiman.enums.Role;
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
public class ProfileResponse {
    private Long id;
    private String uuid;
    private String email;
    private String firstName;
    private String lastName;
    private String fullName;
    private String phoneNumber;
    private Role role;
    private String status;
    private String profileImageUrl;
    
    // Address Details
    private String address;
    private String city;
    private String state;
    private String pinCode;

    // Account Flags
    private Boolean emailVerified;
    private Boolean phoneVerified;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant lastLoginAt;

    // User Preferences
    private NotificationPreferencesDto preferences;

    // Role-specific payload (populated conditionally)
    private AgentProfileDto agentInfo;
    private AdminProfileDto adminInfo;
    private CustomerProfileDto customerInfo;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AgentProfileDto {
        private Long agentId;
        private String vehicleType;
        private String vehicleNumber;
        private Long assignedZoneId;
        private String assignedZoneName;
        private Boolean isAvailable;
        private Integer currentActiveOrders;
        private Integer maxActiveOrders;
        private Double currentLatitude;
        private Double currentLongitude;
        private Instant lastLocationUpdate;
        
        // Operational stats
        private long totalDeliveries;
        private long completedDeliveries;
        private long failedDeliveries;
        private double successRate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdminProfileDto {
        private Long adminId;
        private String department;
        private List<String> permissions;
        private Boolean superAdmin;
        private long totalSystemAudits;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomerProfileDto {
        private Long customerId;
        private String customerType;
        private String companyName;
        private String gstNumber;
        private String defaultPickupAddress;
        private String defaultPickupPincode;
        private long totalOrdersPlaced;
    }
}
