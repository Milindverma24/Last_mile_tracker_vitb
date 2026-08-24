package com.gatiman;

import com.gatiman.entity.*;
import com.gatiman.enums.CustomerType;
import com.gatiman.enums.EmailEventType;
import com.gatiman.enums.EmailStatus;
import com.gatiman.enums.OrderStatus;
import com.gatiman.repository.EmailLogRepository;
import com.gatiman.repository.OrderRepository;
import com.gatiman.repository.UserRepository;
import com.gatiman.service.EmailTemplateService;
import com.gatiman.service.impl.EmailServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock private EmailLogRepository emailLogRepository;
    @Mock private OrderRepository orderRepository;
    @Mock private UserRepository userRepository;
    @Mock private EmailTemplateService templateService;

    private EmailServiceImpl emailService;
    private Order sampleOrder;
    private User customerUser;

    @BeforeEach
    void setUp() {
        emailService = new EmailServiceImpl(
                emailLogRepository,
                orderRepository,
                userRepository,
                templateService
        );

        ReflectionTestUtils.setField(emailService, "emailEnabled", true);
        ReflectionTestUtils.setField(emailService, "fromEmail", "notifications@gatiman.in");
        ReflectionTestUtils.setField(emailService, "fromName", "GATIMAN Logistics");
        ReflectionTestUtils.setField(emailService, "baseUrl", "http://localhost:5173");
        ReflectionTestUtils.setField(emailService, "delayCooldownMinutes", 30);

        customerUser = User.builder()
                .id(1L)
                .firstName("Priya")
                .lastName("Sharma")
                .email("customer@gatiman.local")
                .build();

        Customer customer = Customer.builder()
                .id(10L)
                .user(customerUser)
                .customerType(CustomerType.B2C)
                .build();

        sampleOrder = Order.builder()
                .id(100L)
                .trackingNumber("GTM-20260822-000100")
                .customer(customer)
                .status(OrderStatus.OUT_FOR_DELIVERY)
                .totalCharge(new BigDecimal("180.00"))
                .pickupName("Origin")
                .dropName("Destination")
                .build();

        lenient().when(templateService.generateEmailSubject(any(), any())).thenReturn("Order Subject");
        lenient().when(templateService.buildHtmlEmail(any(), any(), any(), any(), any(), any(), any())).thenReturn("<html>Email</html>");
    }

    @Test
    @DisplayName("Successfully dispatches and persists email log with SENT status")
    void testSendEmailSuccess() {
        when(emailLogRepository.existsByIdempotencyKeyAndStatusIn(anyString(), anyList())).thenReturn(false);
        when(emailLogRepository.save(any(EmailLog.class))).thenAnswer(i -> {
            EmailLog log = i.getArgument(0);
            if (log.getId() == null) log.setId(1L);
            return log;
        });

        emailService.sendOnTheWayEmail(sampleOrder, 2.5, 10);

        ArgumentCaptor<EmailLog> captor = ArgumentCaptor.forClass(EmailLog.class);
        verify(emailLogRepository, atLeastOnce()).save(captor.capture());

        EmailLog saved = captor.getValue();
        assertEquals("customer@gatiman.local", saved.getRecipientEmail());
        assertEquals(EmailEventType.ON_THE_WAY, saved.getEventType());
        assertEquals(EmailStatus.SENT, saved.getStatus());
        assertEquals("GTM-20260822-000100", saved.getTrackingNumber());
    }

    @Test
    @DisplayName("Prevents duplicate email sending for the same idempotency key")
    void testDeduplicationPreventsDuplicate() {
        when(emailLogRepository.existsByIdempotencyKeyAndStatusIn(eq("100_ON_THE_WAY"), anyList())).thenReturn(true);

        emailService.sendOnTheWayEmail(sampleOrder, 2.5, 10);

        verify(emailLogRepository, never()).save(any(EmailLog.class));
    }

    @Test
    @DisplayName("Retrying a failed email updates retry count and status")
    void testRetryEmail() {
        EmailLog failedLog = EmailLog.builder()
                .id(50L)
                .orderId(100L)
                .trackingNumber("GTM-20260822-000100")
                .recipientEmail("customer@gatiman.local")
                .eventType(EmailEventType.DELIVERED)
                .subject("Delivered")
                .htmlContent("<html>Delivered</html>")
                .status(EmailStatus.FAILED)
                .retryCount(0)
                .idempotencyKey("100_DELIVERED")
                .build();

        when(emailLogRepository.findById(50L)).thenReturn(Optional.of(failedLog));
        when(emailLogRepository.save(any(EmailLog.class))).thenAnswer(i -> i.getArgument(0));

        EmailLog retried = emailService.retryEmail(50L);

        assertNotNull(retried);
        assertEquals(1, retried.getRetryCount());
        assertEquals(EmailStatus.SENT, retried.getStatus());
    }

    @Test
    @DisplayName("Successfully dispatches welcome email for newly onboarded user")
    void testSendWelcomeEmail() {
        when(emailLogRepository.existsByIdempotencyKeyAndStatusIn(eq("WELCOME_customer@gatiman.local"), anyList())).thenReturn(false);
        when(emailLogRepository.save(any(EmailLog.class))).thenAnswer(i -> {
            EmailLog log = i.getArgument(0);
            if (log.getId() == null) log.setId(2L);
            return log;
        });
        when(templateService.buildWelcomeEmailHtml(anyString(), anyString(), anyString())).thenReturn("<html>Welcome</html>");

        emailService.sendWelcomeEmail(customerUser);

        ArgumentCaptor<EmailLog> captor = ArgumentCaptor.forClass(EmailLog.class);
        verify(emailLogRepository, atLeastOnce()).save(captor.capture());

        EmailLog saved = captor.getValue();
        assertEquals("customer@gatiman.local", saved.getRecipientEmail());
        assertEquals(EmailEventType.WELCOME, saved.getEventType());
        assertEquals(EmailStatus.SENT, saved.getStatus());
        assertTrue(saved.getSubject().contains("Welcome to GATIMAN Delivery Network"));
    }
}
