package com.gatiman.service.impl;

import com.gatiman.dto.auth.AuthResponse;
import com.gatiman.dto.auth.LoginRequest;
import com.gatiman.dto.auth.RegisterRequest;
import com.gatiman.dto.auth.UserResponse;
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
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
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
