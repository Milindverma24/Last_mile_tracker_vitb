package com.gatiman;

import com.gatiman.entity.*;
import com.gatiman.enums.CustomerType;
import com.gatiman.enums.EmailEventType;
import com.gatiman.enums.OrderStatus;
import com.gatiman.enums.PaymentType;
import com.gatiman.service.EmailTemplateService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class EmailTemplateServiceTest {

    private EmailTemplateService templateService;
    private Order sampleOrder;

    @BeforeEach
    void setUp() {
        templateService = new EmailTemplateService();

        User customerUser = User.builder()
                .id(1L)
                .firstName("Priya")
                .lastName("Sharma")
                .email("priya.sharma@example.com")
                .build();

        Customer customer = Customer.builder()
                .id(10L)
                .user(customerUser)
                .customerType(CustomerType.B2C)
                .build();

        User agentUser = User.builder()
                .id(2L)
                .firstName("Rajesh")
                .lastName("Kumar")
                .email("rajesh.kumar@gatiman.local")
                .build();

        DeliveryAgent agent = DeliveryAgent.builder()
                .id(5L)
                .user(agentUser)
                .vehicleNumber("DL-03-EV-9821")
                .build();

        sampleOrder = Order.builder()
                .id(101L)
                .trackingNumber("GTM-20260822-875171")
                .customer(customer)
                .assignedAgent(agent)
                .status(OrderStatus.IN_TRANSIT)
                .paymentType(PaymentType.PREPAID)
                .totalCharge(new BigDecimal("225.50"))
                .pickupName("Hauz Khas Origin Hub")
                .pickupAddress("42, Hauz Khas Village, South Delhi")
                .dropName("Cyber City Drop Point")
                .dropAddress("101, DLF Cyber City, Phase 3, Gurugram")
                .build();
    }

    @Test
    @DisplayName("Generates valid subjects for all lifecycle events")
    void testSubjectGeneration() {
        for (EmailEventType type : EmailEventType.values()) {
            String subject = templateService.generateEmailSubject(type, sampleOrder);
            assertNotNull(subject);
            if (type != EmailEventType.WELCOME) {
                assertTrue(subject.contains("GTM-20260822-875171"));
            } else {
                assertTrue(subject.contains("Welcome to GATIMAN"));
            }
        }
    }

    @Test
    @DisplayName("Renders HTML email template with all required visual sections and CTA")
    void testBuildHtmlEmailOnTheWay() {
        String html = templateService.buildHtmlEmail(
                EmailEventType.ON_THE_WAY,
                sampleOrder,
                "Priya Sharma",
                3.4,
                8,
                null,
                "http://localhost:5173"
        );

        assertNotNull(html);
        assertTrue(html.contains("GATIMAN"), "Must contain GATIMAN brand");
        assertTrue(html.contains("GTM-20260822-875171"), "Must contain tracking number");
        assertTrue(html.contains("3.4 km"), "Must contain distance");
        assertTrue(html.contains("8 mins"), "Must contain ETA");
        assertTrue(html.contains("₹225.50"), "Must contain price");
        assertTrue(html.contains("Rajesh Kumar"), "Must contain driver name");
        assertTrue(html.contains("DL-03-EV-9821"), "Must contain driver vehicle number");
        assertTrue(html.contains("42, Hauz Khas Village"), "Must contain pickup address");
        assertTrue(html.contains("101, DLF Cyber City"), "Must contain drop destination");
        assertTrue(html.contains("TRACK MY DELIVERY"), "Must contain primary CTA button");
        assertTrue(html.contains("http://localhost:5173/track/GTM-20260822-875171"), "Must contain real tracking link");
        assertTrue(html.contains("DELIVERY PROGRESS"), "Must contain visual delivery timeline");
    }

    @Test
    @DisplayName("Renders Delivered email template correctly")
    void testBuildHtmlEmailDelivered() {
        String html = templateService.buildHtmlEmail(
                EmailEventType.DELIVERED,
                sampleOrder,
                "Priya Sharma",
                0.0,
                0,
                null,
                "http://localhost:5173"
        );

        assertNotNull(html);
        assertTrue(html.contains("Your Package Has Been Delivered 🎉"));
        assertTrue(html.contains("DELIVERED"));
    }

    @Test
    @DisplayName("Renders Near Destination email template correctly")
    void testBuildHtmlEmailNearDestination() {
        String html = templateService.buildHtmlEmail(
                EmailEventType.NEAR_DESTINATION,
                sampleOrder,
                "Priya Sharma",
                0.4,
                2,
                null,
                "http://localhost:5173"
        );

        assertNotNull(html);
        assertTrue(html.contains("Your Delivery is Almost Here!"));
        assertTrue(html.contains("500 meters"));
    }
}
