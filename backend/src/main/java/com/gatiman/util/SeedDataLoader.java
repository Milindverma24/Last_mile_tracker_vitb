package com.gatiman.util;

import com.gatiman.entity.*;
import com.gatiman.enums.*;
import com.gatiman.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class SeedDataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final DeliveryAgentRepository deliveryAgentRepository;
    private final ZoneRepository zoneRepository;
    private final AreaRepository areaRepository;
    private final RateCardRepository rateCardRepository;
    private final RateCardRuleRepository rateCardRuleRepository;
    private final OrderRepository orderRepository;
    private final TrackingEventRepository trackingEventRepository;
    private final DeliveryAttemptRepository deliveryAttemptRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("GATIMAN database already seeded. Skipping initial migration.");
            return;
        }

        log.info("⚡ Seeding GATIMAN platform initial data (1 Admin, 1 Customer, 1 Agent)...");

        String defaultEncodedPassword = passwordEncoder.encode("password123");

        // 1. Exactly 1 Admin User
        User adminUser = User.builder()
                .email("admin@gatiman.com")
                .passwordHash(defaultEncodedPassword)
                .firstName("Operations")
                .lastName("Admin")
                .phoneNumber("+91 99999 88888")
                .address("HQ Hub, Connaught Place")
                .city("New Delhi")
                .state("Delhi")
                .pinCode("110001")
                .role(Role.ADMIN)
                .status("ACTIVE")
                .active(true)
                .build();
        userRepository.save(adminUser);

        // 2. Exactly 1 Customer User
        User customerUser = User.builder()
                .email("customer@gatiman.com")
                .passwordHash(defaultEncodedPassword)
                .firstName("Priya")
                .lastName("Sharma")
                .phoneNumber("+91 98111 22233")
                .address("Flat 402, Green Park Main")
                .city("New Delhi")
                .state("Delhi")
                .pinCode("110016")
                .role(Role.CUSTOMER)
                .status("ACTIVE")
                .active(true)
                .build();
        userRepository.save(customerUser);

        Customer customer = Customer.builder()
                .user(customerUser)
                .customerType(CustomerType.B2C)
                .defaultPickupAddress("42, Sector 14, Hauz Khas, New Delhi")
                .defaultPickupPincode("110016")
                .build();
        customerRepository.save(customer);

        // 3. Exactly 1 Delivery Agent User
        User agentUser = User.builder()
                .email("agent@gatiman.com")
                .passwordHash(defaultEncodedPassword)
                .firstName("Rajesh")
                .lastName("Kumar")
                .phoneNumber("+91 98999 11223")
                .address("B-12, Lajpat Nagar Phase 2")
                .city("New Delhi")
                .state("Delhi")
                .pinCode("110024")
                .role(Role.DELIVERY_AGENT)
                .status("ACTIVE")
                .active(true)
                .build();
        userRepository.save(agentUser);

        // 4. Create Zones and Areas
        Zone southDelhi = Zone.builder()
                .code("DL-SOUTH")
                .name("South Delhi Express Zone")
                .description("South Delhi logistics cluster including Hauz Khas, Saket, Greater Kailash")
                .city("New Delhi")
                .state("Delhi")
                .active(true)
                .isActive(true)
                .build();
        zoneRepository.save(southDelhi);

        Zone northDelhi = Zone.builder()
                .code("DL-NORTH")
                .name("North / Central Delhi Zone")
                .description("Connaught Place, Civil Lines, Model Town")
                .city("New Delhi")
                .state("Delhi")
                .active(true)
                .isActive(true)
                .build();
        zoneRepository.save(northDelhi);

        Zone gurugram = Zone.builder()
                .code("GGN-CENTRAL")
                .name("Gurugram Cyber Hub Zone")
                .description("Cyber City, DLF Phase 1-5, Golf Course Road")
                .city("Gurugram")
                .state("Haryana")
                .active(true)
                .isActive(true)
                .build();
        zoneRepository.save(gurugram);

        Zone noida = Zone.builder()
                .code("NOI-SECTOR")
                .name("Noida Express Hub Zone")
                .description("Sector 18, Sector 62, Expressway")
                .city("Noida")
                .state("Uttar Pradesh")
                .active(true)
                .isActive(true)
                .build();
        zoneRepository.save(noida);

        // Areas
        Area hauzKhas = Area.builder().zone(southDelhi).name("Hauz Khas").pincode("110016").latitude(28.5494).longitude(77.2001).active(true).build();
        Area saket = Area.builder().zone(southDelhi).name("Saket").pincode("110017").latitude(28.5245).longitude(77.2144).active(true).build();
        Area gk = Area.builder().zone(southDelhi).name("Greater Kailash").pincode("110048").latitude(28.5355).longitude(77.2410).active(true).build();

        Area connaughtPlace = Area.builder().zone(northDelhi).name("Connaught Place").pincode("110001").latitude(28.6315).longitude(77.2167).active(true).build();
        Area civilLines = Area.builder().zone(northDelhi).name("Civil Lines").pincode("110054").latitude(28.6791).longitude(77.2255).active(true).build();

        Area dlfPhase2 = Area.builder().zone(gurugram).name("DLF Cyber City").pincode("122002").latitude(28.4900).longitude(77.0888).active(true).build();
        Area golfCourse = Area.builder().zone(gurugram).name("Golf Course Road").pincode("122018").latitude(28.4410).longitude(77.0980).active(true).build();

        Area noidaSec18 = Area.builder().zone(noida).name("Noida Sector 18").pincode("201301").latitude(28.5708).longitude(77.3261).active(true).build();
        Area noidaSec62 = Area.builder().zone(noida).name("Noida Sector 62").pincode("201307").latitude(28.6270).longitude(77.3725).active(true).build();

        areaRepository.saveAll(List.of(hauzKhas, saket, gk, connaughtPlace, civilLines, dlfPhase2, golfCourse, noidaSec18, noidaSec62));

        // 5. Seed Delivery Fleet with Multi-Tier Vehicle Types
        DeliveryAgent agent1 = DeliveryAgent.builder()
                .user(agentUser)
                .vehicleType(VehicleType.EV_SCOOTER)
                .vehicleNumber("DL-03-EV-9821")
                .isAvailable(true)
                .active(true)
                .maxActiveOrders(5)
                .currentActiveOrders(1)
                .assignedZone(southDelhi)
                .currentLatitude(28.5494)
                .currentLongitude(77.2001)
                .status("ACTIVE")
                .build();
        deliveryAgentRepository.save(agent1);

        // Additional Fleet Drivers
        User agentUser2 = User.builder()
                .email("agent.car@gatiman.com")
                .passwordHash(defaultEncodedPassword)
                .firstName("Sunil")
                .lastName("Yadav")
                .phoneNumber("+91 98111 88990")
                .role(Role.DELIVERY_AGENT)
                .status("ACTIVE")
                .active(true)
                .build();
        userRepository.save(agentUser2);

        DeliveryAgent agent2 = DeliveryAgent.builder()
                .user(agentUser2)
                .vehicleType(VehicleType.CAR)
                .vehicleNumber("HR-26-CR-1122")
                .isAvailable(true)
                .active(true)
                .maxActiveOrders(8)
                .currentActiveOrders(0)
                .assignedZone(gurugram)
                .currentLatitude(28.4900)
                .currentLongitude(77.0888)
                .status("ACTIVE")
                .build();
        deliveryAgentRepository.save(agent2);

        User agentUser3 = User.builder()
                .email("agent.tempo@gatiman.com")
                .passwordHash(defaultEncodedPassword)
                .firstName("Harpreet")
                .lastName("Singh")
                .phoneNumber("+91 98777 55443")
                .role(Role.DELIVERY_AGENT)
                .status("ACTIVE")
                .active(true)
                .build();
        userRepository.save(agentUser3);

        DeliveryAgent agent3 = DeliveryAgent.builder()
                .user(agentUser3)
                .vehicleType(VehicleType.TEMPO)
                .vehicleNumber("DL-01-TP-4004")
                .isAvailable(true)
                .active(true)
                .maxActiveOrders(10)
                .currentActiveOrders(0)
                .assignedZone(northDelhi)
                .currentLatitude(28.6315)
                .currentLongitude(77.2167)
                .status("ACTIVE")
                .build();
        deliveryAgentRepository.save(agent3);

        // 6. Create Rate Cards
        // Rate Card 1: B2C Intra-Zone
        RateCard b2cIntra = RateCard.builder()
                .name("Standard B2C Intra-Zone Rate Card")
                .customerType(CustomerType.B2C)
                .routeType(RouteType.INTRA_ZONE)
                .codSurchargeFlat(new BigDecimal("40.00"))
                .codSurchargePercentage(new BigDecimal("2.00"))
                .active(true)
                .isActive(true)
                .effectiveFrom(LocalDate.of(2025, 1, 1))
                .effectiveTo(LocalDate.of(2030, 12, 31))
                .build();
        rateCardRepository.save(b2cIntra);

        RateCardRule r1 = RateCardRule.builder()
                .rateCard(b2cIntra)
                .minWeightKg(BigDecimal.ZERO)
                .maxWeightKg(new BigDecimal("2.000"))
                .basePrice(new BigDecimal("50.00"))
                .perKgRateAboveMin(BigDecimal.ZERO)
                .build();
        RateCardRule r2 = RateCardRule.builder()
                .rateCard(b2cIntra)
                .minWeightKg(new BigDecimal("2.000"))
                .maxWeightKg(new BigDecimal("10.000"))
                .basePrice(new BigDecimal("50.00"))
                .perKgRateAboveMin(new BigDecimal("15.00"))
                .build();
        rateCardRuleRepository.saveAll(List.of(r1, r2));

        // Rate Card 2: B2C Inter-Zone
        RateCard b2cInter = RateCard.builder()
                .name("Standard B2C Inter-Zone Express")
                .customerType(CustomerType.B2C)
                .routeType(RouteType.INTER_ZONE)
                .codSurchargeFlat(new BigDecimal("40.00"))
                .codSurchargePercentage(new BigDecimal("2.00"))
                .active(true)
                .isActive(true)
                .effectiveFrom(LocalDate.of(2025, 1, 1))
                .effectiveTo(LocalDate.of(2030, 12, 31))
                .build();
        rateCardRepository.save(b2cInter);

        RateCardRule r3 = RateCardRule.builder()
                .rateCard(b2cInter)
                .minWeightKg(BigDecimal.ZERO)
                .maxWeightKg(new BigDecimal("2.000"))
                .basePrice(new BigDecimal("90.00"))
                .perKgRateAboveMin(BigDecimal.ZERO)
                .build();
        RateCardRule r4 = RateCardRule.builder()
                .rateCard(b2cInter)
                .minWeightKg(new BigDecimal("2.000"))
                .maxWeightKg(new BigDecimal("20.000"))
                .basePrice(new BigDecimal("90.00"))
                .perKgRateAboveMin(new BigDecimal("25.00"))
                .build();
        rateCardRuleRepository.saveAll(List.of(r3, r4));

        // Rate Card 3: B2C Inter-State Cross Boundary
        RateCard b2cInterState = RateCard.builder()
                .name("Standard B2C Inter-State Express")
                .customerType(CustomerType.B2C)
                .routeType(RouteType.INTER_STATE)
                .codSurchargeFlat(new BigDecimal("50.00"))
                .codSurchargePercentage(new BigDecimal("2.50"))
                .active(true)
                .isActive(true)
                .effectiveFrom(LocalDate.of(2025, 1, 1))
                .effectiveTo(LocalDate.of(2030, 12, 31))
                .build();
        rateCardRepository.save(b2cInterState);

        RateCardRule r3s = RateCardRule.builder()
                .rateCard(b2cInterState)
                .minWeightKg(BigDecimal.ZERO)
                .maxWeightKg(new BigDecimal("2.000"))
                .basePrice(new BigDecimal("150.00"))
                .perKgRateAboveMin(BigDecimal.ZERO)
                .build();
        RateCardRule r4s = RateCardRule.builder()
                .rateCard(b2cInterState)
                .minWeightKg(new BigDecimal("2.000"))
                .maxWeightKg(new BigDecimal("50.000"))
                .basePrice(new BigDecimal("150.00"))
                .perKgRateAboveMin(new BigDecimal("35.00"))
                .build();
        rateCardRuleRepository.saveAll(List.of(r3s, r4s));

        // Rate Card 4: B2B Intra-Zone
        RateCard b2bIntra = RateCard.builder()
                .name("Enterprise B2B Intra-Zone Slabs")
                .customerType(CustomerType.B2B)
                .routeType(RouteType.INTRA_ZONE)
                .codSurchargeFlat(new BigDecimal("30.00"))
                .codSurchargePercentage(new BigDecimal("1.50"))
                .active(true)
                .isActive(true)
                .effectiveFrom(LocalDate.of(2025, 1, 1))
                .effectiveTo(LocalDate.of(2030, 12, 31))
                .build();
        rateCardRepository.save(b2bIntra);

        RateCardRule r5 = RateCardRule.builder()
                .rateCard(b2bIntra)
                .minWeightKg(BigDecimal.ZERO)
                .maxWeightKg(new BigDecimal("5.000"))
                .basePrice(new BigDecimal("40.00"))
                .perKgRateAboveMin(BigDecimal.ZERO)
                .build();
        RateCardRule r6 = RateCardRule.builder()
                .rateCard(b2bIntra)
                .minWeightKg(new BigDecimal("5.000"))
                .maxWeightKg(new BigDecimal("50.000"))
                .basePrice(new BigDecimal("40.00"))
                .perKgRateAboveMin(new BigDecimal("10.00"))
                .build();
        rateCardRuleRepository.saveAll(List.of(r5, r6));

        // Rate Card 5: B2B Inter-Zone
        RateCard b2bInter = RateCard.builder()
                .name("Enterprise B2B Inter-Zone Slabs")
                .customerType(CustomerType.B2B)
                .routeType(RouteType.INTER_ZONE)
                .codSurchargeFlat(new BigDecimal("30.00"))
                .codSurchargePercentage(new BigDecimal("1.50"))
                .active(true)
                .isActive(true)
                .effectiveFrom(LocalDate.of(2025, 1, 1))
                .effectiveTo(LocalDate.of(2030, 12, 31))
                .build();
        rateCardRepository.save(b2bInter);

        RateCardRule r7 = RateCardRule.builder()
                .rateCard(b2bInter)
                .minWeightKg(BigDecimal.ZERO)
                .maxWeightKg(new BigDecimal("5.000"))
                .basePrice(new BigDecimal("70.00"))
                .perKgRateAboveMin(BigDecimal.ZERO)
                .build();
        RateCardRule r8 = RateCardRule.builder()
                .rateCard(b2bInter)
                .minWeightKg(new BigDecimal("5.000"))
                .maxWeightKg(new BigDecimal("100.000"))
                .basePrice(new BigDecimal("70.00"))
                .perKgRateAboveMin(new BigDecimal("18.00"))
                .build();
        rateCardRuleRepository.saveAll(List.of(r7, r8));

        // 6. Seed Sample Orders
        // Order 1: Out for delivery
        Order order1 = Order.builder()
                .trackingNumber("GTM-20260820-875171")
                .orderNumber("GTM-20260820-875171")
                .customer(customer)
                .customerType(CustomerType.B2C)
                .paymentType(PaymentType.COD)
                .status(OrderStatus.OUT_FOR_DELIVERY)
                .pickupName("Priya Sharma")
                .pickupPhone("+91 98111 22233")
                .pickupAddress("Flat 402, Green Park Main, South Delhi")
                .pickupPincode("110016")
                .pickupArea(hauzKhas)
                .pickupZone(southDelhi)
                .dropName("Vikram Seth")
                .dropPhone("+91 98222 33344")
                .dropAddress("Tower C, DLF Cyber Greens, Cyber City")
                .dropPincode("122002")
                .dropArea(dlfPhase2)
                .dropZone(gurugram)
                .routeType(RouteType.INTER_ZONE)
                .actualWeightKg(new BigDecimal("1.500"))
                .volumetricWeightKg(new BigDecimal("2.400"))
                .billableWeightKg(new BigDecimal("2.400"))
                .baseCharge(new BigDecimal("115.00"))
                .codSurcharge(new BigDecimal("42.30"))
                .totalCharge(new BigDecimal("157.30"))
                .assignedAgent(agent1)
                .rateCard(b2cInter)
                .build();

        OrderPackage pkg1 = OrderPackage.builder()
                .order(order1)
                .packageDescription("Electronics accessories & cables")
                .lengthCm(new BigDecimal("30.00"))
                .breadthCm(new BigDecimal("20.00"))
                .heightCm(new BigDecimal("20.00"))
                .declaredValue(new BigDecimal("3500.00"))
                .build();
        order1.getPackages().add(pkg1);
        orderRepository.save(order1);

        TrackingEvent te1 = TrackingEvent.builder()
                .order(order1)
                .newStatus(OrderStatus.CREATED)
                .actorName("Priya Sharma")
                .actorRole("CUSTOMER")
                .remarks("Shipment registered")
                .eventTimestamp(Instant.now().minusSeconds(14400))
                .build();

        TrackingEvent te2 = TrackingEvent.builder()
                .order(order1)
                .previousStatus(OrderStatus.CREATED)
                .newStatus(OrderStatus.ASSIGNED)
                .actorName("Auto-Assignment Engine")
                .actorRole("SYSTEM")
                .remarks("Assigned to Rajesh Kumar (EV Scooter)")
                .eventTimestamp(Instant.now().minusSeconds(10800))
                .build();

        TrackingEvent te3 = TrackingEvent.builder()
                .order(order1)
                .previousStatus(OrderStatus.ASSIGNED)
                .newStatus(OrderStatus.PICKED_UP)
                .actorName("Rajesh Kumar")
                .actorRole("AGENT")
                .remarks("Package collected from pickup address")
                .eventTimestamp(Instant.now().minusSeconds(7200))
                .build();

        TrackingEvent te4 = TrackingEvent.builder()
                .order(order1)
                .previousStatus(OrderStatus.PICKED_UP)
                .newStatus(OrderStatus.OUT_FOR_DELIVERY)
                .actorName("Rajesh Kumar")
                .actorRole("AGENT")
                .remarks("Out for delivery at recipient location")
                .eventTimestamp(Instant.now().minusSeconds(1800))
                .build();

        trackingEventRepository.saveAll(List.of(te1, te2, te3, te4));

        log.info("✅ GATIMAN seed data loading completed successfully.");
    }
}
