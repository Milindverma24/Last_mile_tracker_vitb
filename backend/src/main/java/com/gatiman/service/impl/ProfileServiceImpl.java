package com.gatiman.service.impl;

import com.gatiman.dto.profile.*;
import com.gatiman.entity.*;
import com.gatiman.enums.OrderStatus;
import com.gatiman.enums.Role;
import com.gatiman.exception.BusinessRuleException;
import com.gatiman.exception.UnauthorizedException;
import com.gatiman.repository.*;
import com.gatiman.service.AuditService;
import com.gatiman.service.ProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProfileServiceImpl implements ProfileService {

    private final UserRepository userRepository;
    private final UserPreferenceRepository userPreferenceRepository;
    private final DeliveryAgentRepository deliveryAgentRepository;
    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    private final DeliveryAttemptRepository deliveryAttemptRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    @Override
    @Transactional
    public ProfileResponse getProfile(User user) {
        User managedUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new UnauthorizedException("User session not found"));

        UserPreference preferences = userPreferenceRepository.findByUserId(managedUser.getId())
                .orElseGet(() -> createDefaultPreferences(managedUser));

        NotificationPreferencesDto prefDto = NotificationPreferencesDto.builder()
                .orderUpdates(preferences.getOrderUpdates())
                .deliveryUpdates(preferences.getDeliveryUpdates())
                .rescheduleUpdates(preferences.getRescheduleUpdates())
                .securityAlerts(preferences.getSecurityAlerts())
                .marketing(preferences.getMarketing())
                .language(preferences.getLanguage())
                .timezone(preferences.getTimezone())
                .dateFormat(preferences.getDateFormat())
                .build();

        ProfileResponse.ProfileResponseBuilder builder = ProfileResponse.builder()
                .id(managedUser.getId())
                .uuid(managedUser.getUuid())
                .email(managedUser.getEmail())
                .firstName(managedUser.getFirstName())
                .lastName(managedUser.getLastName())
                .fullName(managedUser.getFullName())
                .phoneNumber(managedUser.getPhoneNumber())
                .role(managedUser.getRole())
                .status(managedUser.getStatus())
                .profileImageUrl(managedUser.getProfileImageUrl())
                .address(managedUser.getAddress())
                .city(managedUser.getCity())
                .state(managedUser.getState())
                .pinCode(managedUser.getPinCode())
                .emailVerified(managedUser.getEmailVerified())
                .phoneVerified(managedUser.getPhoneVerified())
                .createdAt(managedUser.getCreatedAt())
                .updatedAt(managedUser.getUpdatedAt())
                .lastLoginAt(managedUser.getLastLoginAt() != null ? managedUser.getLastLoginAt() : managedUser.getUpdatedAt())
                .preferences(prefDto);

        // Populate Role-specific details
        if (managedUser.getRole() == Role.DELIVERY_AGENT) {
            deliveryAgentRepository.findByUserId(managedUser.getId()).ifPresent(agent -> {
                long completed = orderRepository.findByAssignedAgentIdOrderByCreatedAtDesc(agent.getId()).stream()
                        .filter(o -> o.getStatus() == OrderStatus.DELIVERED)
                        .count();
                long failed = deliveryAttemptRepository.findByAgentId(agent.getId()).stream()
                        .filter(a -> "FAILED".equalsIgnoreCase(a.getStatus()))
                        .count();
                long total = completed + failed;
                double rate = total > 0 ? ((double) completed / total) * 100.0 : 100.0;

                builder.agentInfo(ProfileResponse.AgentProfileDto.builder()
                        .agentId(agent.getId())
                        .vehicleType(agent.getVehicleType() != null ? agent.getVehicleType().name() : "BIKE")
                        .vehicleNumber(agent.getVehicleNumber())
                        .assignedZoneId(agent.getAssignedZone() != null ? agent.getAssignedZone().getId() : null)
                        .assignedZoneName(agent.getAssignedZone() != null ? agent.getAssignedZone().getName() : "All Cluster Hubs")
                        .isAvailable(agent.getIsAvailable())
                        .currentActiveOrders(agent.getCurrentActiveOrders())
                        .maxActiveOrders(agent.getMaxActiveOrders())
                        .currentLatitude(agent.getCurrentLatitude())
                        .currentLongitude(agent.getCurrentLongitude())
                        .lastLocationUpdate(agent.getLastLocationUpdate())
                        .totalDeliveries(total)
                        .completedDeliveries(completed)
                        .failedDeliveries(failed)
                        .successRate(Math.round(rate * 10.0) / 10.0)
                        .build());
            });
        } else if (managedUser.getRole() == Role.CUSTOMER) {
            customerRepository.findByUserId(managedUser.getId()).ifPresent(cust -> {
                long totalOrders = orderRepository.findByCustomerIdOrderByCreatedAtDesc(cust.getId()).size();
                builder.customerInfo(ProfileResponse.CustomerProfileDto.builder()
                        .customerId(cust.getId())
                        .customerType(cust.getCustomerType() != null ? cust.getCustomerType().name() : "B2C")
                        .companyName(cust.getCompanyName())
                        .gstNumber(cust.getGstNumber())
                        .defaultPickupAddress(cust.getDefaultPickupAddress())
                        .defaultPickupPincode(cust.getDefaultPickupPincode())
                        .totalOrdersPlaced(totalOrders)
                        .build());
            });
        } else if (managedUser.getRole() == Role.ADMIN) {
            long auditCount = auditLogRepository.count();
            builder.adminInfo(ProfileResponse.AdminProfileDto.builder()
                    .adminId(managedUser.getId())
                    .department("Operations HQ & Logistics Control")
                    .permissions(Arrays.asList(
                            "DISPATCH_MANAGE",
                            "RATE_CARD_WRITE",
                            "ZONE_MANAGE",
                            "AGENT_ASSIGN",
                            "RESCHEDULE_APPROVE",
                            "AUDIT_VIEW"
                    ))
                    .superAdmin(true)
                    .totalSystemAudits(auditCount)
                    .build());
        }

        return builder.build();
    }

    @Override
    @Transactional
    public ProfileResponse updateProfile(User user, UpdateProfileRequest request) {
        User managedUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new UnauthorizedException("User session not found"));

        managedUser.setFirstName(request.getFirstName().trim());
        if (request.getLastName() != null) {
            managedUser.setLastName(request.getLastName().trim());
        }
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().trim().isEmpty()) {
            managedUser.setPhoneNumber(request.getPhoneNumber().trim());
        }
        if (request.getProfileImageUrl() != null) {
            managedUser.setProfileImageUrl(request.getProfileImageUrl().trim());
        }
        if (request.getAddress() != null) {
            managedUser.setAddress(request.getAddress().trim());
        }
        if (request.getCity() != null) {
            managedUser.setCity(request.getCity().trim());
        }
        if (request.getState() != null) {
            managedUser.setState(request.getState().trim());
        }
        if (request.getPinCode() != null) {
            managedUser.setPinCode(request.getPinCode().trim());
        }
        managedUser.setUpdatedAt(Instant.now());

        userRepository.save(managedUser);

        auditService.logAction(
                managedUser.getEmail(),
                managedUser.getRole().name(),
                "PROFILE_UPDATED",
                "User",
                managedUser.getId(),
                "User updated personal profile information"
        );

        log.info("Profile updated successfully for user: {}", managedUser.getEmail());
        return getProfile(managedUser);
    }

    @Override
    @Transactional
    public void changePassword(User user, ChangePasswordRequest request) {
        User managedUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new UnauthorizedException("User session not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), managedUser.getPasswordHash())) {
            throw new BusinessRuleException("INVALID_PASSWORD: Current password does not match our records");
        }

        if (request.getNewPassword().equals(request.getCurrentPassword())) {
            throw new BusinessRuleException("PASSWORD_SAME: New password must be different from current password");
        }

        if (request.getConfirmPassword() != null && !request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BusinessRuleException("PASSWORD_MISMATCH: New password and confirmation password do not match");
        }

        managedUser.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        managedUser.setUpdatedAt(Instant.now());
        userRepository.save(managedUser);

        auditService.logAction(
                managedUser.getEmail(),
                managedUser.getRole().name(),
                "PASSWORD_CHANGED",
                "User",
                managedUser.getId(),
                "User successfully changed account security password"
        );

        log.info("Password successfully changed for user: {}", managedUser.getEmail());
    }

    @Override
    @Transactional(readOnly = true)
    public NotificationPreferencesDto getNotificationPreferences(User user) {
        UserPreference preferences = userPreferenceRepository.findByUserId(user.getId())
                .orElseGet(() -> createDefaultPreferences(user));

        return NotificationPreferencesDto.builder()
                .orderUpdates(preferences.getOrderUpdates())
                .deliveryUpdates(preferences.getDeliveryUpdates())
                .rescheduleUpdates(preferences.getRescheduleUpdates())
                .securityAlerts(preferences.getSecurityAlerts())
                .marketing(preferences.getMarketing())
                .language(preferences.getLanguage())
                .timezone(preferences.getTimezone())
                .dateFormat(preferences.getDateFormat())
                .build();
    }

    @Override
    @Transactional
    public NotificationPreferencesDto updateNotificationPreferences(User user, NotificationPreferencesRequest request) {
        User managedUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new UnauthorizedException("User session not found"));

        UserPreference preferences = userPreferenceRepository.findByUserId(managedUser.getId())
                .orElseGet(() -> createDefaultPreferences(managedUser));

        if (request.getOrderUpdates() != null) preferences.setOrderUpdates(request.getOrderUpdates());
        if (request.getDeliveryUpdates() != null) preferences.setDeliveryUpdates(request.getDeliveryUpdates());
        if (request.getRescheduleUpdates() != null) preferences.setRescheduleUpdates(request.getRescheduleUpdates());
        if (request.getMarketing() != null) preferences.setMarketing(request.getMarketing());
        // Security alerts are mandatory and cannot be disabled
        preferences.setSecurityAlerts(true);
        if (request.getLanguage() != null) preferences.setLanguage(request.getLanguage());
        if (request.getTimezone() != null) preferences.setTimezone(request.getTimezone());
        if (request.getDateFormat() != null) preferences.setDateFormat(request.getDateFormat());

        userPreferenceRepository.save(preferences);

        auditService.logAction(
                managedUser.getEmail(),
                managedUser.getRole().name(),
                "PREFERENCES_UPDATED",
                "UserPreference",
                preferences.getId(),
                "User updated notification and localization preferences"
        );

        return getNotificationPreferences(managedUser);
    }

    @Override
    @Transactional
    public void updateAgentAvailability(User user, boolean available) {
        if (user.getRole() != Role.DELIVERY_AGENT && user.getRole() != Role.ADMIN) {
            throw new BusinessRuleException("ACCESS_DENIED: Only delivery agents can update driver availability");
        }

        DeliveryAgent agent = deliveryAgentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BusinessRuleException("AGENT_NOT_FOUND: Delivery agent record not found"));

        agent.setIsAvailable(available);
        agent.setStatus(available ? "ACTIVE" : "ON_BREAK");
        deliveryAgentRepository.save(agent);

        auditService.logAction(
                user.getEmail(),
                user.getRole().name(),
                "AGENT_AVAILABILITY_CHANGED",
                "DeliveryAgent",
                agent.getId(),
                "Driver availability changed to: " + (available ? "ON DUTY" : "OFF DUTY")
        );

        log.info("Agent {} availability set to {}", user.getEmail(), available);
    }

    private UserPreference createDefaultPreferences(User user) {
        UserPreference pref = UserPreference.builder()
                .user(user)
                .orderUpdates(true)
                .deliveryUpdates(true)
                .rescheduleUpdates(true)
                .securityAlerts(true)
                .marketing(false)
                .language("en")
                .timezone("Asia/Kolkata")
                .dateFormat("DD/MM/YYYY")
                .build();
        return userPreferenceRepository.save(pref);
    }
}
