# GATIMAN — System Design Write-Up

**Stack**: Spring Boot 3.3.4 · React 18 · PostgreSQL 16 · Razorpay · WebSocket STOMP  
**Deployment**: Render (API + DB) · Vercel (SPA)

GATIMAN is a last-mile delivery platform for urban corridors. Customers book shipments through a wizard, the system prices them dynamically, assigns a driver, and tracks parcels through a strict state machine until delivery — or through failure recovery.

---

## 1. Rate Calculation Engine

Charges are computed in `PricingServiceImpl` through four cooperating services. Rates come from database-stored `RateCard` and `RateCardRule` records, so pricing is adjustable without redeployment.

**Step 1 — Volumetric vs. Actual Weight**

We use the industry-standard volumetric divisor:

```
Volumetric Weight = (Length × Breadth × Height) / 5000
Billable Weight   = max(Actual Weight, Volumetric Weight)
```

This prevents bulky-but-light packages from being undercharged. Invalid dimensions throw a `BusinessRuleException`.

**Step 2 — Route Classification**

Pickup and drop PINs are resolved to zones (see §2). The pair determines route type: `INTRA_ZONE`, `INTER_ZONE`, or `INTER_STATE`. Route type selects which rate card applies.

**Step 3 — Weight Slab Resolution**

Each rate card contains sorted weight slabs with min/max boundaries, a base price, and a per-kg rate. The system finds the matching slab; if weight exceeds the highest defined slab, the top tier applies as a catchall. Excess weight is ceiling-rounded to full kilograms:

```
Base Charge = Slab Base Price + ⌈Billable Weight − Slab Min⌉ × Per-Kg Rate
```

**Step 4 — COD Surcharge & Total**

For COD orders, a surcharge (flat fee + configurable percentage of base charge) is added:

```
Total Charge = Base Charge + COD Surcharge
```

Rate cards are scoped by `CustomerType` (B2C/B2B) × `RouteType`, forming a configurable pricing matrix.

---

## 2. Zone Detection

Zone detection (`ZoneDetectionServiceImpl`) maps a 6-digit PIN code to a `Zone` entity — the entry point for pricing and assignment.

**Primary lookup**: exact PIN match against the `areas` table. Each area belongs to one zone. If found and active, returned with confidence 1.0.

**Fallback**: if no exact match exists but an area name is provided, a substring search across zone names catches unmapped localities. Confidence drops to 0.85.

**Route type determination** compares the pickup zone and drop zone:
- Same zone ID → `INTRA_ZONE`
- Different zones, different state fields → `INTER_STATE`  
- Otherwise → `INTER_ZONE`

If either PIN can't be resolved, the system throws `ZONE_NOT_FOUND` with a clear message. We chose a database-driven approach over geocoding APIs to avoid per-request latency and external dependency costs — a practical trade-off for a defined service area like Delhi NCR.

---

## 3. Auto-Assignment Logic

When an order is created (or rescheduled), `AgentAssignmentServiceImpl.autoAssign()` selects a driver through a two-phase process.

**Phase 1 — Eligibility Filter** (`AgentEligibilityServiceImpl`)

All agents are loaded and filtered by hard constraints:
- `active = true` AND `isAvailable = true`
- `currentActiveOrders < maxActiveOrders` (default cap: 5)
- Vehicle can carry the package: weight ≤ vehicle max weight AND max dimension ≤ vehicle max dimension. Six vehicle tiers exist — Bike (5 kg), EV Scooter (5 kg), Car (25 kg), Van (25 kg), Tempo (150 kg), Truck (500 kg).

**Phase 2 — Proximity Scoring**

Eligible agents are ranked by a composite score (lower is better):

```
Score = Haversine Distance (km) + (Active Orders × 2.0) − Zone Bonus
```

- **Distance**: Haversine great-circle distance from the agent's last GPS coordinates to the pickup centroid.
- **Workload penalty**: `currentActiveOrders × 2.0` — spreads load across the fleet.
- **Zone bonus**: −10 points if the agent is already assigned to the pickup zone.
- **Tie-breaker**: `(agentId % 10) × 0.01` for deterministic ordering.

The top-scoring agent is assigned atomically within a `@Transactional` block: their workload counter increments, the order transitions to `ASSIGNED`, a `DeliveryAttempt` record is created, and a tracking event is appended. If no eligible agent exists, the API returns a clear error with the required vehicle type.

Admin can also manually assign or reassign agents, bypassing auto-dispatch.

---

## 4. Failed Delivery Handling

Order status follows a strict finite state machine enforced by `OrderStatusTransitionServiceImpl`. Only `OUT_FOR_DELIVERY → FAILED` is a valid failure transition.

**Failure capture**: The driver records a failure with a structured `FailureReason` (`CUSTOMER_UNAVAILABLE`, `INCORRECT_ADDRESS`, `CUSTOMER_REJECTED`, `PREMISES_CLOSED`). The system decrements the agent's workload, persists the status change, and logs an immutable tracking event with GPS coordinates.

**Customer notification**: An in-app notification is pushed immediately, prompting the customer to reschedule.

**Rescheduling**: The customer selects a new delivery date and time slot via the tracking portal. This creates a `RescheduleRequest` in `PENDING` state. An operations admin reviews and approves (or rejects). On approval, the order transitions `FAILED → RESCHEDULED → ASSIGNED`, re-entering auto-assignment. A new `DeliveryAttempt` record tracks the retry independently.

**Safeguards**: Duplicate pending reschedule requests are blocked. Past dates are rejected. Only the order owner (or admin) can request rescheduling. Each reschedule increments a counter on the order for operational visibility.

The system does not currently enforce a maximum attempt limit automatically — that policy is left to operations. This is a deliberate scope decision; automated RTO (Return to Origin) after N failures is a planned future enhancement.
