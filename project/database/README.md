# 🗄️ GATIMAN Database Deployment Guide

This directory contains the production database DDL schema and deployment documentation.

---

## Files in this Directory

- [`schema.sql`](file:///Users/milindverma/Desktop/last_mile_delivery/database/schema.sql) — Complete PostgreSQL DDL script creating all 17 tables, foreign key constraints, indexes, and cascades.

---

## 🚀 Deployment Options

### Option 1: Automatic Migration via Spring Boot (Recommended)
Spring Boot is configured with Hibernate JPA ORM (`spring.jpa.hibernate.ddl-auto: update`).
When deploying the backend container with PostgreSQL connection parameters, Hibernate automatically creates and updates all tables and relationships on startup.

Set the following environment variables in production:
```bash
SPRING_PROFILES_ACTIVE=postgres
DATABASE_URL=jdbc:postgresql://<your-db-host>:5432/<your-db-name>
DATABASE_USERNAME=<your-db-user>
DATABASE_PASSWORD=<your-db-password>
```

---

### Option 2: Direct SQL Import (Neon, Supabase, AWS RDS, pgAdmin)
You can directly execute [`schema.sql`](file:///Users/milindverma/Desktop/last_mile_delivery/database/schema.sql) in any PostgreSQL console:

```bash
# Using psql command line
psql "postgresql://username:password@hostname:5432/gatiman_db" -f database/schema.sql
```

---

### Option 3: Local / Cloud Docker Container
To start a PostgreSQL database locally or in cloud Docker:

```bash
docker run --name gatiman-postgres \
  -e POSTGRES_DB=gatiman_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password123 \
  -p 5432:5432 \
  -v ./database/schema.sql:/docker-entrypoint-initdb.d/init.sql \
  -d postgres:16-alpine
```

---

## 📊 Database Schema Entity Map

| Table Name | Description | Key Relationships |
| :--- | :--- | :--- |
| **`users`** | Core accounts (Admin, Customer, Driver) | Base entity with BCrypt auth |
| **`customers`** | Customer enterprise profiles | `user_id -> users(id)` |
| **`delivery_agents`** | Drivers, vehicle types, live location | `user_id -> users(id)`, `assigned_zone_id -> zones(id)` |
| **`zones`** | Geographical delivery clusters | Parent of areas |
| **`areas`** | PIN Code mappings | `zone_id -> zones(id)` |
| **`rate_cards`** | Intra/Inter-Zone B2B/B2C slabs & COD fees | Surcharge formulas |
| **`orders`** | Shipments, volumetric billing, tracking | `customer_id`, `assigned_agent_id`, `pickup_zone_id`, `drop_zone_id` |
| **`order_packages`** | L × B × H package dimensions | `order_id -> orders(id)` |
| **`tracking_events`** | Audit trail & state machine transitions | `order_id -> orders(id)` |
| **`agent_locations`** | High-frequency telemetry breadcrumbs | `agent_id -> delivery_agents(id)` |
| **`delivery_attempts`**| Failed & successful delivery proof | `order_id -> orders(id)` |
| **`reschedule_requests`**| Customer date/slot rescheduling | `order_id -> orders(id)` |
| **`notifications`** | In-app real-time alerts | `user_id -> users(id)` |
| **`email_logs`** | SMTP audit trail for dispatched emails | `order_id -> orders(id)` |
| **`audit_logs`** | Security and role activity compliance | System-wide |
