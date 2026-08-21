package com.gatiman;

import com.gatiman.dto.profile.*;
import com.gatiman.entity.*;
import com.gatiman.enums.Role;
import com.gatiman.exception.BusinessRuleException;
import com.gatiman.repository.*;
import com.gatiman.service.AuditService;
import com.gatiman.service.impl.ProfileServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ProfileServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserPreferenceRepository userPreferenceRepository;

    @Mock
    private DeliveryAgentRepository deliveryAgentRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private DeliveryAttemptRepository deliveryAttemptRepository;

    @Mock
    private AuditLogRepository auditLogRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private ProfileServiceImpl profileService;

    private User customerUser;
    private User agentUser;
    private User adminUser;
    private UserPreference defaultPref;

    @BeforeEach
    void setUp() {
        customerUser = User.builder()
                .id(1L)
                .email("customer@gatiman.local")
                .firstName("Priya")
                .lastName("Sharma")
                .phoneNumber("+91 98111 22233")
                .role(Role.CUSTOMER)
                .passwordHash("encoded_pwd")
                .build();

        agentUser = User.builder()
                .id(2L)
                .email("agent@gatiman.local")
                .firstName("Rajesh")
                .lastName("Kumar")
                .phoneNumber("+91 98999 11223")
                .role(Role.DELIVERY_AGENT)
                .passwordHash("encoded_pwd")
                .build();

        adminUser = User.builder()
                .id(3L)
                .email("admin@gatiman.local")
                .firstName("Operations")
                .lastName("Admin")
                .phoneNumber("+91 99000 11223")
                .role(Role.ADMIN)
                .passwordHash("encoded_pwd")
                .build();

        defaultPref = UserPreference.builder()
                .id(10L)
                .user(customerUser)
                .orderUpdates(true)
                .deliveryUpdates(true)
                .rescheduleUpdates(true)
                .securityAlerts(true)
                .marketing(false)
                .language("en")
                .timezone("Asia/Kolkata")
                .dateFormat("DD/MM/YYYY")
                .build();
    }

    @Test
    @DisplayName("Should retrieve Customer profile with preferences and customer metadata")
    void testGetCustomerProfile() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(customerUser));
        when(userPreferenceRepository.findByUserId(1L)).thenReturn(Optional.of(defaultPref));
        when(customerRepository.findByUserId(1L)).thenReturn(Optional.of(Customer.builder()
                .id(100L)
                .user(customerUser)
                .companyName("Nexus Logistics")
                .build()));
        when(orderRepository.findByCustomerIdOrderByCreatedAtDesc(100L)).thenReturn(Collections.emptyList());

        ProfileResponse response = profileService.getProfile(customerUser);

        assertNotNull(response);
        assertEquals("Priya", response.getFirstName());
        assertEquals("Priya Sharma", response.getFullName());
        assertEquals(Role.CUSTOMER, response.getRole());
        assertNotNull(response.getPreferences());
        assertNotNull(response.getCustomerInfo());
        assertEquals("Nexus Logistics", response.getCustomerInfo().getCompanyName());
    }

    @Test
    @DisplayName("Should retrieve Agent profile with vehicle and operational metrics")
    void testGetAgentProfile() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(agentUser));
        when(userPreferenceRepository.findByUserId(2L)).thenReturn(Optional.of(defaultPref));
        when(deliveryAgentRepository.findByUserId(2L)).thenReturn(Optional.of(DeliveryAgent.builder()
                .id(200L)
                .user(agentUser)
                .vehicleNumber("DL-03-EV-9821")
                .isAvailable(true)
                .maxActiveOrders(5)
                .currentActiveOrders(2)
                .build()));
        when(orderRepository.findByAssignedAgentIdOrderByCreatedAtDesc(200L)).thenReturn(Collections.emptyList());
        when(deliveryAttemptRepository.findByAgentId(200L)).thenReturn(Collections.emptyList());

        ProfileResponse response = profileService.getProfile(agentUser);

        assertNotNull(response);
        assertEquals("Rajesh", response.getFirstName());
        assertEquals(Role.DELIVERY_AGENT, response.getRole());
        assertNotNull(response.getAgentInfo());
        assertEquals("DL-03-EV-9821", response.getAgentInfo().getVehicleNumber());
        assertTrue(response.getAgentInfo().getIsAvailable());
    }

    @Test
    @DisplayName("Should update personal information and return updated profile")
    void testUpdateProfile() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(customerUser));
        when(userPreferenceRepository.findByUserId(1L)).thenReturn(Optional.of(defaultPref));

        UpdateProfileRequest request = UpdateProfileRequest.builder()
                .firstName("Priyanka")
                .lastName("Verma")
                .phoneNumber("+91 99999 88888")
                .address("77, Green Park Extension")
                .city("New Delhi")
                .state("Delhi")
                .pinCode("110016")
                .build();

        ProfileResponse updated = profileService.updateProfile(customerUser, request);

        assertEquals("Priyanka", updated.getFirstName());
        assertEquals("Verma", updated.getLastName());
        assertEquals("+91 99999 88888", updated.getPhoneNumber());
        assertEquals("77, Green Park Extension", updated.getAddress());
        verify(userRepository).save(any(User.class));
        verify(auditService).logAction(eq("customer@gatiman.local"), eq("CUSTOMER"), eq("PROFILE_UPDATED"), eq("User"), eq(1L), anyString());
    }

    @Test
    @DisplayName("Should change password when current password matches")
    void testChangePasswordSuccess() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(customerUser));
        when(passwordEncoder.matches("old_password", "encoded_pwd")).thenReturn(true);
        when(passwordEncoder.encode("new_password123")).thenReturn("new_encoded_pwd");

        ChangePasswordRequest request = ChangePasswordRequest.builder()
                .currentPassword("old_password")
                .newPassword("new_password123")
                .confirmPassword("new_password123")
                .build();

        assertDoesNotThrow(() -> profileService.changePassword(customerUser, request));
        verify(userRepository).save(customerUser);
        assertEquals("new_encoded_pwd", customerUser.getPasswordHash());
    }

    @Test
    @DisplayName("Should reject password change if current password is wrong")
    void testChangePasswordInvalidCurrent() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(customerUser));
        when(passwordEncoder.matches("wrong_pwd", "encoded_pwd")).thenReturn(false);

        ChangePasswordRequest request = ChangePasswordRequest.builder()
                .currentPassword("wrong_pwd")
                .newPassword("new_password123")
                .build();

        assertThrows(BusinessRuleException.class, () -> profileService.changePassword(customerUser, request));
    }

    @Test
    @DisplayName("Should update agent availability")
    void testUpdateAgentAvailability() {
        DeliveryAgent agent = DeliveryAgent.builder()
                .id(200L)
                .user(agentUser)
                .isAvailable(true)
                .build();

        when(deliveryAgentRepository.findByUserId(2L)).thenReturn(Optional.of(agent));

        profileService.updateAgentAvailability(agentUser, false);

        assertFalse(agent.getIsAvailable());
        assertEquals("ON_BREAK", agent.getStatus());
        verify(deliveryAgentRepository).save(agent);
    }
}
