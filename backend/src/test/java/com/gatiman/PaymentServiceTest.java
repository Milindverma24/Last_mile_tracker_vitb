package com.gatiman;

import com.gatiman.dto.payment.RazorpayOrderResponse;
import com.gatiman.dto.payment.RazorpayVerifyRequest;
import com.gatiman.dto.payment.RazorpayVerifyResponse;
import com.gatiman.entity.*;
import com.gatiman.enums.CustomerType;
import com.gatiman.enums.OrderStatus;
import com.gatiman.enums.PaymentStatus;
import com.gatiman.enums.PaymentType;
import com.gatiman.exception.BusinessRuleException;
import com.gatiman.repository.OrderRepository;
import com.gatiman.repository.TrackingEventRepository;
import com.gatiman.service.AuditService;
import com.gatiman.service.impl.PaymentServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PaymentServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private TrackingEventRepository trackingEventRepository;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private PaymentServiceImpl paymentService;

    private User testUser;
    private Customer testCustomer;
    private Order testOrder;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(paymentService, "keyId", "rzp_test_gatiman123");
        ReflectionTestUtils.setField(paymentService, "keySecret", "gatimanSecretKey123");
        ReflectionTestUtils.setField(paymentService, "currency", "INR");
        ReflectionTestUtils.setField(paymentService, "companyName", "GATIMAN Logistics Inc.");

        testUser = User.builder()
                .id(1L)
                .email("customer@gatiman.local")
                .firstName("Priya")
                .lastName("Sharma")
                .build();

        testCustomer = Customer.builder()
                .id(10L)
                .user(testUser)
                .customerType(CustomerType.B2C)
                .build();

        testOrder = Order.builder()
                .id(100L)
                .trackingNumber("GTM-20260820-999888")
                .customer(testCustomer)
                .totalCharge(new BigDecimal("150.00"))
                .paymentType(PaymentType.PREPAID)
                .paymentStatus(PaymentStatus.PENDING)
                .status(OrderStatus.CREATED)
                .pickupName("Priya Sharma")
                .pickupPhone("+91 98111 22233")
                .build();
    }

    @Test
    @DisplayName("Should create Razorpay order with calculated amount in paise")
    void testCreateRazorpayOrder() {
        when(orderRepository.findById(100L)).thenReturn(Optional.of(testOrder));

        RazorpayOrderResponse response = paymentService.createRazorpayOrder(100L, testUser);

        assertNotNull(response);
        assertEquals(100L, response.getOrderId());
        assertEquals("GTM-20260820-999888", response.getTrackingNumber());
        assertEquals(new BigDecimal("150.00"), response.getAmount());
        assertEquals(15000L, response.getAmountInPaise());
        assertEquals("INR", response.getCurrency());
        assertEquals("rzp_test_gatiman123", response.getKeyId());
        assertTrue(response.getRazorpayOrderId().startsWith("order_"));
        verify(orderRepository).updateRazorpayOrderId(eq(100L), anyString());
    }

    @Test
    @DisplayName("Should verify valid HMAC SHA256 payment signature and transition order to PAID")
    void testVerifyPaymentValidSignature() {
        String rzpOrderId = "order_test_123456";
        String rzpPaymentId = "pay_test_987654";
        String secret = "gatimanSecretKey123";
        String validSignature = PaymentServiceImpl.calculateHmacSha256(rzpOrderId + "|" + rzpPaymentId, secret);

        testOrder.setRazorpayOrderId(rzpOrderId);
        when(orderRepository.findById(100L)).thenReturn(Optional.of(testOrder));

        RazorpayVerifyRequest request = RazorpayVerifyRequest.builder()
                .orderId(100L)
                .razorpayOrderId(rzpOrderId)
                .razorpayPaymentId(rzpPaymentId)
                .razorpaySignature(validSignature)
                .build();

        RazorpayVerifyResponse response = paymentService.verifyPayment(request, testUser);

        assertTrue(response.isVerified());
        assertEquals(PaymentStatus.PAID, response.getPaymentStatus());
        verify(orderRepository).updatePaymentDetails(eq(100L), eq(PaymentStatus.PAID), eq(rzpPaymentId), eq(validSignature), any(Instant.class));
        verify(trackingEventRepository).save(any(TrackingEvent.class));
        verify(auditService).logAction(eq("customer@gatiman.local"), any(), eq("PAYMENT_VERIFIED"), eq("Order"), eq(100L), anyString());
    }

    @Test
    @DisplayName("Should reject payment verification with invalid signature")
    void testVerifyPaymentInvalidSignature() {
        String rzpOrderId = "order_test_123456";
        String rzpPaymentId = "pay_test_987654";

        testOrder.setRazorpayOrderId(rzpOrderId);
        when(orderRepository.findById(100L)).thenReturn(Optional.of(testOrder));

        RazorpayVerifyRequest request = RazorpayVerifyRequest.builder()
                .orderId(100L)
                .razorpayOrderId(rzpOrderId)
                .razorpayPaymentId(rzpPaymentId)
                .razorpaySignature("invalid_tampered_signature_12345")
                .build();

        assertThrows(BusinessRuleException.class, () -> paymentService.verifyPayment(request, testUser));
        verify(orderRepository).updatePaymentDetails(eq(100L), eq(PaymentStatus.FAILED), eq(rzpPaymentId), eq("invalid_tampered_signature_12345"), any(Instant.class));
    }
}
