package com.gatiman.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gatiman.dto.auth.*;
import com.gatiman.entity.Customer;
import com.gatiman.entity.DeliveryAgent;
import com.gatiman.entity.User;
import com.gatiman.enums.CustomerType;
import com.gatiman.enums.Role;
import com.gatiman.enums.VehicleType;
import com.gatiman.exception.BusinessRuleException;
import com.gatiman.repository.CustomerRepository;
import com.gatiman.repository.DeliveryAgentRepository;
import com.gatiman.repository.UserRepository;
import com.gatiman.repository.ZoneRepository;
import com.gatiman.security.CustomUserDetails;
import com.gatiman.security.JwtTokenProvider;
import com.gatiman.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final DeliveryAgentRepository deliveryAgentRepository;
    private final ZoneRepository zoneRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        String token = tokenProvider.generateToken(authentication);
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = userDetails.getUser();

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .user(mapToUserResponse(user))
                .build();
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessRuleException("Email address is already registered: " + request.getEmail());
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName() != null ? request.getLastName() : "")
                .phoneNumber(request.getPhoneNumber() != null ? request.getPhoneNumber() : "")
                .role(request.getRole() != null ? request.getRole() : Role.CUSTOMER)
                .status("ACTIVE")
                .active(true)
                .build();

        User savedUser = userRepository.save(user);

        if (savedUser.getRole() == Role.CUSTOMER) {
            Customer customer = Customer.builder()
                    .user(savedUser)
                    .customerType(request.getCustomerType() != null ? request.getCustomerType() : CustomerType.B2C)
                    .companyName(request.getCompanyName())
                    .gstNumber(request.getGstNumber())
                    .build();
            customerRepository.save(customer);
        } else if (savedUser.getRole() == Role.DELIVERY_AGENT) {
            DeliveryAgent agent = DeliveryAgent.builder()
                    .user(savedUser)
                    .vehicleType(request.getVehicleType() != null ? request.getVehicleType() : VehicleType.BIKE)
                    .vehicleNumber(request.getVehicleNumber() != null ? request.getVehicleNumber() : "DL-01-GA-1000")
                    .isAvailable(true)
                    .active(true)
                    .maxActiveOrders(5)
                    .currentActiveOrders(0)
                    .assignedZone(request.getAssignedZoneId() != null ? zoneRepository.findById(request.getAssignedZoneId()).orElse(null) : null)
                    .status("ACTIVE")
                    .build();
            deliveryAgentRepository.save(agent);
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        String token = tokenProvider.generateToken(authentication);

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .user(mapToUserResponse(savedUser))
                .build();
    }

    @Override
    @Transactional
    public AuthResponse googleLogin(GoogleAuthRequest request) {
        String email = request.getEmail();
        String firstName = request.getFirstName();
        String lastName = request.getLastName();

        // 1. If Google ID token / credential is provided, decode payload
        if (request.getCredential() != null && !request.getCredential().isBlank()) {
            try {
                String[] parts = request.getCredential().split("\\.");
                if (parts.length >= 2) {
                    String payloadJson = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
                    ObjectMapper mapper = new ObjectMapper();
                    JsonNode rootNode = mapper.readTree(payloadJson);

                    if (rootNode.has("email")) {
                        email = rootNode.get("email").asText();
                    }
                    if (rootNode.has("given_name")) {
                        firstName = rootNode.get("given_name").asText();
                    } else if (rootNode.has("name")) {
                        firstName = rootNode.get("name").asText();
                    }
                    if (rootNode.has("family_name")) {
                        lastName = rootNode.get("family_name").asText();
                    }
                }
            } catch (Exception e) {
                log.warn("Could not decode Google credential JWT: {}", e.getMessage());
            }
        }

        if (email == null || email.isBlank()) {
            throw new BusinessRuleException("GOOGLE_AUTH_FAILED: Valid email address could not be extracted from Google credentials.");
        }

        // 2. Find or Provision User
        final String finalEmail = email.toLowerCase().trim();
        final String finalFirstName = (firstName != null && !firstName.isBlank()) ? firstName : "Google";
        final String finalLastName = (lastName != null) ? lastName : "User";
        final CustomerType targetCustomerType = request.getCustomerType() != null ? request.getCustomerType() : CustomerType.B2C;

        User user = userRepository.findByEmail(finalEmail)
                .map(existingUser -> {
                    // Edge Case Check: If existing user is a CUSTOMER but missing Customer profile table row, auto-heal it
                    if (existingUser.getRole() == Role.CUSTOMER) {
                        customerRepository.findByUserId(existingUser.getId()).orElseGet(() -> {
                            log.info("Auto-healing missing Customer entity for existing user: {}", existingUser.getEmail());
                            Customer healed = Customer.builder()
                                    .user(existingUser)
                                    .customerType(targetCustomerType)
                                    .companyName(request.getCompanyName())
                                    .gstNumber(request.getGstNumber())
                                    .defaultPickupAddress("")
                                    .defaultPickupPincode("")
                                    .build();
                            return customerRepository.save(healed);
                        });
                    }
                    return existingUser;
                })
                .orElseGet(() -> {
                    log.info("Provisioning new {} account via Google OAuth: {}", targetCustomerType, finalEmail);
                    User newUser = User.builder()
                            .email(finalEmail)
                            .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString()))
                            .firstName(finalFirstName)
                            .lastName(finalLastName)
                            .phoneNumber("")
                            .role(Role.CUSTOMER)
                            .status("ACTIVE")
                            .active(true)
                            .build();
                    User saved = userRepository.save(newUser);

                    Customer customer = Customer.builder()
                            .user(saved)
                            .customerType(targetCustomerType)
                            .companyName(request.getCompanyName())
                            .gstNumber(request.getGstNumber())
                            .defaultPickupAddress("")
                            .defaultPickupPincode("")
                            .build();
                    customerRepository.save(customer);
                    return saved;
                });

        // 3. Issue GATIMAN Platform JWT
        String token = tokenProvider.generateTokenForUser(user);

        log.info("Google OAuth login successful for user: {} (Role: {})", user.getEmail(), user.getRole());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .user(mapToUserResponse(user))
                .build();
    }

    @Override
    public UserResponse getCurrentUser(User user) {
        return mapToUserResponse(user);
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .uuid(user.getUuid())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .status(user.getStatus())
                .active(user.getActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
