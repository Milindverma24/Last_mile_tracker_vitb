# ⚡ GATIMAN — Intelligent Last-Mile Delivery Management Platform
> **“गति से गंतव्य तक”** • *Smart Logistics. Seamless Delivery.*

[![GitHub Repository](https://img.shields.io/badge/GitHub-Milindverma24%2FLast__mile__tracker__vitb-181717?style=flat&logo=github)](https://github.com/Milindverma24/Last_mile_tracker_vitb)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-6DB33F?style=flat&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8+-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

### 🌐 Hosted Production Application
* **Frontend Web App (Vercel)**: [https://frontend-ten-lyart-76.vercel.app](https://frontend-ten-lyart-76.vercel.app)
* **Backend API (Render)**: [https://last-mile-tracker-vitb.onrender.com](https://last-mile-tracker-vitb.onrender.com)
* **OpenAPI 3.0 / Swagger UI**: [https://last-mile-tracker-vitb.onrender.com/swagger-ui.html](https://last-mile-tracker-vitb.onrender.com/swagger-ui.html)
* **GitHub Repository**: [https://github.com/Milindverma24/Last_mile_tracker_vitb](https://github.com/Milindverma24/Last_mile_tracker_vitb)

A production-grade, full-stack logistics management platform built for modern supply chains. GATIMAN features deterministic volumetric pricing (`(L × B × H) / 5000`), intelligent proximity auto-assignment, multi-attempt failed delivery recovery with customer rescheduling, append-only immutable tracking event audit logs, and distinct operational cockpits for **Customers**, **Delivery Agents**, and **Operations Admins**.

---

## 📸 Application Screenshots & User Interface

### 1. Landing Page & Public Telemetry
![GATIMAN Landing Page](docs/screenshots/landing_page.png)

### 2. Customer Portal — Dashboard & Live Shipments
![Customer Dashboard](docs/screenshots/customer_dashboard.png)

### 3. Customer Portal — Doorstep Booking & Volumetric Rate Estimator
![Customer Create Order Wizard](docs/screenshots/customer_create_order.png)

### 4. Delivery Driver Partner Portal — Active Run Sheet & Handover
![Agent Delivery Dashboard](docs/screenshots/agent_dashboard.png)

### 5. Live Public Tracking & Real-Time Telemetry
![Public Tracking Page](docs/screenshots/tracking_page.png)

### 6. Operations Admin Cockpit — Fleet Analytics & Health
![Admin Operations Cockpit](docs/screenshots/admin_dashboard.png)

### 7. Operations Admin Cockpit — Orders Dispatch Matrix
![Admin Orders Dispatch Matrix](docs/screenshots/admin_orders.png)

---

## 🏗️ Architecture & Technology Stack

### Backend
* **Runtime**: Java 21 / 23+
* **Framework**: Spring Boot 3.3.4 (Spring Web, Spring Security, Spring Data JPA, Bean Validation)
* **Authentication**: Stateless JWT (`io.jsonwebtoken:jjwt-api:0.12.6`), BCrypt hashing, Role-Based Access Control (RBAC)
* **Database**: PostgreSQL (`gatiman_db`) with in-memory H2 PostgreSQL-compatible fallback for zero-config local prototyping
* **API Documentation**: OpenAPI 3.0 via SpringDoc (`springdoc-openapi-starter-webmvc-ui:2.6.0`)
* **Logging**: Structured SLF4J audit logging

### Frontend
* **Core**: React 19 + TypeScript strictly typed
* **Build Tool**: Vite 8+
* **Routing**: React Router 7+ (`ProtectedRoute`, `RoleRoute`, nested role layouts)
* **Styling**: Tailwind CSS, custom SaaS design system, responsive card/table transitions
* **Server State**: TanStack Query v5 (`@tanstack/react-query`) with automatic cache invalidation
* **Forms & Validation**: React Hook Form + Zod (`@hookform/resolvers/zod`)
* **Icons & Visualization**: Lucide React + Recharts

---

## 📁 Repository Structure

```
last_mile_delivery/
├── backend/
│   ├── Dockerfile
│   ├── pom.xml
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/gatiman/
│   │   │   │   ├── config/              # SecurityConfig, CorsConfig, OpenApiConfig
│   │   │   │   ├── controller/          # Health, Auth, Order, Agent, Zone, RateCard, Admin
│   │   │   │   ├── dto/
│   │   │   │   │   ├── common/          # ApiResponse, ErrorResponse, HealthResponse
│   │   │   │   │   ├── auth/            # LoginRequest, RegisterRequest, AuthResponse
│   │   │   │   │   ├── order/           # CreateOrder, ChargeCalc, StatusUpdate, Reschedule
│   │   │   │   │   ├── agent/           # AgentResponse, AssignmentResponse, Availability
│   │   │   │   │   ├── zone/            # ZoneRequest, AreaRequest, ZoneResponse
│   │   │   │   │   ├── ratecard/        # RateCardRequest, RateCardRuleDto
│   │   │   │   │   └── admin/           # DashboardResponse
│   │   │   │   ├── entity/              # User, Customer, Agent, Zone, Area, RateCard, Order, etc.
│   │   │   │   ├── enums/               # Role, OrderStatus, CustomerType, PaymentType, RouteType
│   │   │   │   ├── exception/           # GlobalExceptionHandler, ResourceNotFound, BusinessRule
│   │   │   │   ├── repository/          # Spring Data JPA Repositories
│   │   │   │   ├── security/            # JwtTokenProvider, CustomUserDetails, JwtFilter
│   │   │   │   ├── service/             # Service interfaces
│   │   │   │   │   └── impl/            # Business logic implementations
│   │   │   │   └── util/                # SeedDataLoader (Auto-provisions demo network)
│   │   │   │   └── GatimanApplication.java
│   │   │   └── resources/
│   │   │       ├── application.yml
│   │   │       └── application-postgres.yml
│   │   └── test/java/com/gatiman/       # Unit tests (Auth, Order, Zone, RateCard, Assignment, Tracking)
│
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── public/
│   │   └── logo.png                     # Official GATIMAN speed delivery logo
│   └── src/
│       ├── api/                         # Centralized Axios client & dedicated API modules
│       ├── components/                  # UI, Common, Layout components
│       ├── context/                     # AuthContext (JWT session state)
│       ├── hooks/                       # TanStack Query custom hooks (useOrders, useZones, etc.)
│       ├── layouts/                     # AuthLayout, CustomerLayout, AgentLayout, AdminLayout
│       ├── pages/
│       │   ├── auth/                    # LoginPage, RegisterPage
│       │   ├── customer/                # Dashboard, CreateOrder, Orders, Track, Reschedule, Profile
│       │   ├── agent/                   # Dashboard, Deliveries, History, Profile
│       │   └── admin/                   # Dashboard, Orders Dispatch, Zones, RateCards, Agents, Analytics
│       ├── routes/                      # AppRoutes, ProtectedRoute, RoleRoute
│       ├── schemas/                     # Zod validation schemas
│       ├── types/                       # Strict TypeScript interfaces
│       ├── App.tsx
│       └── main.tsx
│
├── docker-compose.yml                   # Multi-container orchestration (postgres, backend, frontend)
├── LICENSE                              # MIT License
└── README.md
```

---

## 🔑 Demo Credentials & Personas

All accounts are pre-seeded on application startup with the development password: `password123`.

| Portal | Email | Password | Role & Capabilities |
| :--- | :--- | :--- | :--- |
| **Operations Admin** | `admin@gatiman.local` | `password123` | Master dispatch console, auto-assignment engine, zone cluster configuration, dynamic rate card rules, KPI analytics |
| **Delivery Agent** | `agent1@gatiman.local` | `password123` | Touch-friendly status progression (`PICKED_UP` $\rightarrow$ `IN_TRANSIT` $\rightarrow$ `OUT_FOR_DELIVERY` $\rightarrow$ `DELIVERED`/`FAILED`), on/off duty toggle, failure reason logger |
| **Delivery Agent #2** | `agent2@gatiman.local` | `password123` | Secondary fleet driver in North Delhi hub |
| **Customer** | `customer@gatiman.local` | `password123` | 6-Step booking wizard, instant volumetric charge calculation, live immutable tracking timeline, failed delivery rescheduling hub |

*(Aliases `admin@gatiman.com`, `customer@gatiman.com`, and `rajesh.agent@gatiman.com` are also supported).*

---

## 🚀 Running Locally

### Prerequisites
* JDK 21+ and Apache Maven 3.9+
* Node.js 20+ and npm
* (Optional) PostgreSQL 15+ or Docker

---

### Step 1: Start PostgreSQL (Optional — H2 is pre-configured by default)
To use native PostgreSQL:
```bash
createdb gatiman_db
```
Configure environment variables in your terminal or backend `application-postgres.yml`:
```bash
export DATABASE_URL=jdbc:postgresql://localhost:5432/gatiman_db
export DATABASE_USERNAME=postgres
export DATABASE_PASSWORD=postgres
```

---

### Step 2: Start Spring Boot Backend (Port 8088)
```bash
cd backend
mvn spring-boot:run
```
The backend initializes the database and seeds initial zones, rate cards, drivers, and sample shipments.
* **API Base URL**: `http://localhost:8088/api`
* **Health Check**: `http://localhost:8088/api/health`
* **Swagger 3.0 API Docs**: `http://localhost:8088/swagger-ui/index.html`
* **H2 Console Browser**: `http://localhost:8088/h2-console`

---

### Step 3: Start React Frontend (Port 5174 / 5173)
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5174/](http://localhost:5174/) in your browser.

---

## 🐳 Running with Docker Compose

To launch the complete infrastructure (PostgreSQL + Spring Boot Backend + Nginx React Frontend):

```bash
docker-compose up --build
```
* **Frontend**: [http://localhost:5174](http://localhost:5174)
* **Backend API**: [http://localhost:8088/api](http://localhost:8088/api)
* **PostgreSQL**: `localhost:5432` (`gatiman_db`)

---

## 📐 Business Logic & Engineering Specifications

### 1. Volumetric Weight Calculation Formula
$$\text{Volumetric Weight (kg)} = \frac{\text{Length (cm)} \times \text{Breadth (cm)} \times \text{Height (cm)}}{5000}$$
$$\text{Billable Weight (kg)} = \max(\text{Actual Weight}, \text{Volumetric Weight})$$

### 2. Rate Card Slabs
* **Intra-Zone vs. Inter-Zone**: Detected automatically based on pickup vs. drop PIN code mapping.
* **B2B vs. B2C Slabs**: Base weight allowance (2kg for B2C, 5kg for B2B) + incremental rate per kg above minimum.
* **COD Surcharge**: `Flat COD Surcharge + (% Surcharge × Base Price)`.

### 3. Finite State Machine Lifecycle
$$\text{CREATED} \longrightarrow \text{ASSIGNED} \longrightarrow \text{PICKED\_UP} \longrightarrow \text{IN\_TRANSIT} \longrightarrow \text{OUT\_FOR\_DELIVERY} \longrightarrow \begin{cases} \text{DELIVERED} \\ \text{FAILED} \longrightarrow \text{RESCHEDULED} \longrightarrow \text{ASSIGNED} \end{cases}$$

### 4. Smart Proximity Auto-Assignment
Balances:
1. Active Driver Workload (Must be $< \text{Max Capacity}$ quota).
2. Preferred Regional Zone Match.
3. Haversine GPS Distance between agent coordinates and pickup location.

---

## 🧪 Automated Testing
Run backend unit test suite:
```bash
cd backend
mvn clean test
```
**Results**: 64 / 64 unit and integration tests passing (`AuthServiceTest`, `OrderServiceTest`, `ZoneServiceTest`, `RateCardServiceTest`, `AgentAssignmentServiceTest`, `PaymentServiceTest`, `EmailServiceTest`, `EmailTemplateServiceTest`, `TrackingServiceTest`, `ProfileServiceTest`, `RescheduleServiceTest`, `OrderStatusTransitionServiceTest`, `NotificationServiceTest`, `VolumetricWeightServiceTest`, `CodPricingServiceTest`, `ZoneDetectionServiceTest`).

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Copyright © 2026 [Milind Verma](https://github.com/Milindverma24). All rights reserved.
