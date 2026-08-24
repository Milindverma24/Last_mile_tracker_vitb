-- ============================================================================
-- GATIMAN LOGISTICS PLATFORM - PRODUCTION DATABASE DDL SCHEMA (PostgreSQL)
-- ============================================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    version BIGINT DEFAULT 0,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(30),
    role VARCHAR(30) NOT NULL DEFAULT 'CUSTOMER', -- 'ADMIN', 'CUSTOMER', 'DELIVERY_AGENT'
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 2. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS customers (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255),
    gst_number VARCHAR(50),
    customer_type VARCHAR(20) NOT NULL DEFAULT 'B2C', -- 'B2C', 'B2B'
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. ZONES TABLE
CREATE TABLE IF NOT EXISTS zones (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. AREAS TABLE (PIN Codes linked to Zones)
CREATE TABLE IF NOT EXISTS areas (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    pincode VARCHAR(20) NOT NULL UNIQUE,
    zone_id BIGINT NOT NULL REFERENCES zones(id) ON DELETE RESTRICT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_areas_pincode ON areas(pincode);
CREATE INDEX IF NOT EXISTS idx_areas_zone_id ON areas(zone_id);

-- 5. RATE CARDS TABLE
CREATE TABLE IF NOT EXISTS rate_cards (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    customer_type VARCHAR(20) NOT NULL, -- 'B2C', 'B2B'
    route_type VARCHAR(30) NOT NULL, -- 'INTRA_ZONE', 'INTER_ZONE'
    base_weight_kg NUMERIC(8, 3) NOT NULL,
    base_rate NUMERIC(10, 2) NOT NULL,
    additional_weight_rate_per_kg NUMERIC(10, 2) NOT NULL,
    cod_flat_fee NUMERIC(10, 2) NOT NULL DEFAULT 40.00,
    cod_percentage NUMERIC(5, 2) NOT NULL DEFAULT 2.00,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. RATE CARD RULES (Optional custom tier modifiers)
CREATE TABLE IF NOT EXISTS rate_card_rules (
    id BIGSERIAL PRIMARY KEY,
    rate_card_id BIGINT NOT NULL REFERENCES rate_cards(id) ON DELETE CASCADE,
    min_weight_kg NUMERIC(8, 3) NOT NULL,
    max_weight_kg NUMERIC(8, 3),
    rate_per_kg NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. DELIVERY AGENTS TABLE
CREATE TABLE IF NOT EXISTS delivery_agents (
    id BIGSERIAL PRIMARY KEY,
    version BIGINT DEFAULT 0,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    vehicle_type VARCHAR(30) NOT NULL DEFAULT 'BIKE', -- 'BIKE', 'EV_SCOOTER', 'CAR', 'VAN', 'TEMPO'
    vehicle_number VARCHAR(50) NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    max_active_orders INT NOT NULL DEFAULT 5,
    current_active_orders INT NOT NULL DEFAULT 0,
    assigned_zone_id BIGINT REFERENCES zones(id) ON DELETE SET NULL,
    current_latitude DOUBLE PRECISION,
    current_longitude DOUBLE PRECISION,
    last_location_update TIMESTAMP WITH TIME ZONE,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agents_available ON delivery_agents(is_available);
CREATE INDEX IF NOT EXISTS idx_agents_status ON delivery_agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_zone_id ON delivery_agents(assigned_zone_id);

-- 8. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    version BIGINT DEFAULT 0,
    tracking_number VARCHAR(100) NOT NULL UNIQUE,
    order_number VARCHAR(100) UNIQUE,
    customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    customer_type VARCHAR(20) NOT NULL, -- 'B2C', 'B2B'
    payment_type VARCHAR(20) NOT NULL, -- 'PREPAID', 'COD'
    payment_status VARCHAR(30) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'PAID', 'FAILED', 'REFUNDED'
    razorpay_order_id VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    razorpay_signature TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'CREATED', -- 'CREATED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'CANCELLED'
    pickup_name VARCHAR(150) NOT NULL,
    pickup_phone VARCHAR(30) NOT NULL,
    pickup_address TEXT NOT NULL,
    pickup_pincode VARCHAR(20) NOT NULL,
    pickup_area_id BIGINT REFERENCES areas(id) ON DELETE SET NULL,
    pickup_zone_id BIGINT REFERENCES zones(id) ON DELETE SET NULL,
    drop_name VARCHAR(150) NOT NULL,
    drop_phone VARCHAR(30) NOT NULL,
    drop_address TEXT NOT NULL,
    drop_pincode VARCHAR(20) NOT NULL,
    drop_area_id BIGINT REFERENCES areas(id) ON DELETE SET NULL,
    drop_zone_id BIGINT REFERENCES zones(id) ON DELETE SET NULL,
    route_type VARCHAR(30) NOT NULL, -- 'INTRA_ZONE', 'INTER_ZONE'
    actual_weight_kg NUMERIC(8, 3) NOT NULL,
    volumetric_weight_kg NUMERIC(8, 3) NOT NULL,
    billable_weight_kg NUMERIC(8, 3) NOT NULL,
    base_charge NUMERIC(10, 2) NOT NULL,
    cod_surcharge NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_charge NUMERIC(10, 2) NOT NULL,
    assigned_agent_id BIGINT REFERENCES delivery_agents(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP WITH TIME ZONE,
    picked_up_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    failed_reason TEXT,
    failure_category VARCHAR(50),
    next_attempt_date DATE,
    attempt_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_tracking_num ON orders(tracking_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_agent_id ON orders(assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- 9. ORDER PACKAGES TABLE (Dimensions)
CREATE TABLE IF NOT EXISTS order_packages (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    length_cm NUMERIC(8, 2) NOT NULL,
    breadth_cm NUMERIC(8, 2) NOT NULL,
    height_cm NUMERIC(8, 2) NOT NULL,
    actual_weight_kg NUMERIC(8, 3) NOT NULL,
    volumetric_weight_kg NUMERIC(8, 3) NOT NULL,
    package_description VARCHAR(255),
    declared_value NUMERIC(12, 2)
);

-- 10. TRACKING EVENTS TABLE
CREATE TABLE IF NOT EXISTS tracking_events (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    actor_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    actor_name VARCHAR(150),
    actor_role VARCHAR(50),
    location_name VARCHAR(255),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    remarks TEXT,
    event_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tracking_order_id ON tracking_events(order_id);

-- 11. AGENT LIVE LOCATIONS (Telemetry breadcrumbs)
CREATE TABLE IF NOT EXISTS agent_locations (
    id BIGSERIAL PRIMARY KEY,
    agent_id BIGINT NOT NULL REFERENCES delivery_agents(id) ON DELETE CASCADE,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    speed_kmh DOUBLE PRECISION,
    heading_degrees DOUBLE PRECISION,
    battery_level INT,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agent_locations_agent ON agent_locations(agent_id, recorded_at DESC);

-- 12. DELIVERY ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS delivery_attempts (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    agent_id BIGINT NOT NULL REFERENCES delivery_agents(id) ON DELETE RESTRICT,
    attempt_number INT NOT NULL,
    attempted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL, -- 'SUCCESSFUL', 'FAILED'
    failure_reason VARCHAR(100),
    failure_notes TEXT,
    photo_proof_url TEXT
);

-- 13. RESCHEDULE REQUESTS TABLE
CREATE TABLE IF NOT EXISTS reschedule_requests (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    requested_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    requested_slot_date DATE NOT NULL,
    requested_slot_time_window VARCHAR(50),
    special_instructions TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED'
    reviewed_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 14. IN-APP NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_id BIGINT REFERENCES orders(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    action_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);

-- 15. EMAIL AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS email_logs (
    id BIGSERIAL PRIMARY KEY,
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(150),
    event_type VARCHAR(50) NOT NULL,
    order_id BIGINT REFERENCES orders(id) ON DELETE SET NULL,
    subject VARCHAR(255) NOT NULL,
    html_body TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'SENT', -- 'SENT', 'FAILED', 'SIMULATED'
    provider_message_id VARCHAR(150),
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 16. SECURITY AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_email VARCHAR(255),
    user_role VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    entity_name VARCHAR(100),
    entity_id BIGINT,
    details TEXT,
    ip_address VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- 17. USER NOTIFICATION PREFERENCES TABLE
CREATE TABLE IF NOT EXISTS user_preferences (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    email_notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    sms_notifications_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    push_notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    notify_on_pickup BOOLEAN NOT NULL DEFAULT TRUE,
    notify_on_in_transit BOOLEAN NOT NULL DEFAULT TRUE,
    notify_on_out_for_delivery BOOLEAN NOT NULL DEFAULT TRUE,
    notify_on_delivery BOOLEAN NOT NULL DEFAULT TRUE,
    notify_on_delay BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
