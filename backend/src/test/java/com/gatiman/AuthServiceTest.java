package com.gatiman;

import com.gatiman.dto.auth.AuthResponse;
import com.gatiman.dto.auth.LoginRequest;
import com.gatiman.dto.auth.RegisterRequest;
import com.gatiman.entity.Customer;
import com.gatiman.entity.User;
import com.gatiman.enums.CustomerType;
import com.gatiman.enums.Role;
import com.gatiman.repository.CustomerRepository;
import com.gatiman.repository.DeliveryAgentRepository;
import com.gatiman.repository.UserRepository;
import com.gatiman.repository.ZoneRepository;
import com.gatiman.security.CustomUserDetails;
import com.gatiman.security.JwtTokenProvider;
import com.gatiman.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private DeliveryAgentRepository deliveryAgentRepository;

    @Mock
    private ZoneRepository zoneRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthServiceImpl authService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("customer@gatiman.local")
                .passwordHash("hashedPass")
                .firstName("Priya")
                .lastName("Sharma")
                .role(Role.CUSTOMER)
                .active(true)
                .status("ACTIVE")
                .build();
    }

    @Test
    void testLoginSuccess() {
        LoginRequest request = new LoginRequest("customer@gatiman.local", "password123");
        Authentication authentication = mock(Authentication.class);
        CustomUserDetails userDetails = new CustomUserDetails(testUser);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        when(tokenProvider.generateToken(authentication)).thenReturn("jwt.token.mock");
        when(authentication.getPrincipal()).thenReturn(userDetails);

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("jwt.token.mock", response.getToken());
        assertEquals("customer@gatiman.local", response.getUser().getEmail());
    }

    @Test
    void testRegisterCustomerSuccess() {
        RegisterRequest request = RegisterRequest.builder()
                .email("new@gatiman.local")
                .password("password123")
                .firstName("New")
                .lastName("Customer")
                .role(Role.CUSTOMER)
                .customerType(CustomerType.B2C)
                .build();

        Authentication authentication = mock(Authentication.class);

        when(userRepository.existsByEmail("new@gatiman.local")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenAnswer(i -> {
            User u = i.getArgument(0);
            u.setId(2L);
            return u;
        });
        when(customerRepository.save(any(Customer.class))).thenAnswer(i -> i.getArgument(0));
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        when(tokenProvider.generateToken(authentication)).thenReturn("token.jwt");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("token.jwt", response.getToken());
        assertEquals("new@gatiman.local", response.getUser().getEmail());
    }
}
