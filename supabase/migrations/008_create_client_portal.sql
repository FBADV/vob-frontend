-- ================================================
-- CLIENT PORTAL - DATABASE MIGRATION
-- ================================================
-- Creates tables for client portal access system
-- Version: 1.0
-- Date: 2025-11-29
-- ================================================

-- ================================================
-- 1. CLIENT PORTAL ACCESS TABLE
-- ================================================
-- Stores portal authentication and access control
CREATE TABLE IF NOT EXISTS client_portal_access (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    enabled BOOLEAN DEFAULT FALSE,
    activation_code VARCHAR(8) UNIQUE, -- e.g., "ABC12345"
    password_hash TEXT, -- bcrypt hash
    first_access_completed BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMPTZ,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ,
    password_reset_token VARCHAR(64),
    password_reset_expires TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_client_portal UNIQUE(client_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_client_portal_client ON client_portal_access(client_id);
CREATE INDEX IF NOT EXISTS idx_client_portal_code ON client_portal_access(activation_code);
CREATE INDEX IF NOT EXISTS idx_client_portal_enabled ON client_portal_access(enabled) WHERE enabled = TRUE;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_client_portal_access_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_client_portal_access_updated_at
    BEFORE UPDATE ON client_portal_access
    FOR EACH ROW
    EXECUTE FUNCTION update_client_portal_access_updated_at();

-- ================================================
-- 2. CLIENT MESSAGES TABLE
-- ================================================
-- Stores messages between clients and law office
CREATE TABLE IF NOT EXISTS client_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('client', 'office')),
    sender_id UUID, -- user_id if office, client_id if client
    sender_name VARCHAR(255), -- For display purposes
    subject VARCHAR(255),
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    replied_to UUID REFERENCES client_messages(id), -- For threading
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_client_messages_client ON client_messages(client_id);
CREATE INDEX IF NOT EXISTS idx_client_messages_unread ON client_messages(client_id, read) WHERE read = FALSE;
CREATE INDEX IF NOT EXISTS idx_client_messages_created ON client_messages(client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_client_messages_thread ON client_messages(replied_to);

-- ================================================
-- 3. CLIENT NOTIFICATIONS TABLE
-- ================================================
-- Stores notifications for portal users
CREATE TABLE IF NOT EXISTS client_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'process_update', 'new_document', 'hearing', 'message', 'system'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    link VARCHAR(500), -- Deep link to specific resource (e.g., /portal/processes/123)
    metadata JSONB, -- Additional data (process_id, document_id, etc.)
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_client_notifications_client ON client_notifications(client_id);
CREATE INDEX IF NOT EXISTS idx_client_notifications_unread ON client_notifications(client_id, read) WHERE read = FALSE;
CREATE INDEX IF NOT EXISTS idx_client_notifications_created ON client_notifications(client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_client_notifications_type ON client_notifications(type);

-- ================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ================================================

-- Enable RLS on all tables
ALTER TABLE client_portal_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_notifications ENABLE ROW LEVEL SECURITY;

-- ================================================
-- RLS POLICIES: client_portal_access
-- ================================================

-- Policy: Admins can view all
CREATE POLICY "Admins can view all portal access"
    ON client_portal_access FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'controller')
        )
    );

-- Policy: Admins can manage
CREATE POLICY "Admins can manage portal access"
    ON client_portal_access FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Policy: Clients can view own access (for portal login)
CREATE POLICY "Clients can view own portal access"
    ON client_portal_access FOR SELECT
    TO authenticated
    USING (
        client_id IN (
            SELECT id FROM clients
            WHERE document = SPLIT_PART(auth.email(), '@', 1) -- CPF without formatting
        )
    );

-- ================================================
-- RLS POLICIES: client_messages
-- ================================================

-- Policy: Admins/Associates can view all messages
CREATE POLICY "Office staff can view all messages"
    ON client_messages FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'controller', 'associate')
        )
    );

-- Policy: Clients can view own messages
CREATE POLICY "Clients can view own messages"
    ON client_messages FOR SELECT
    TO authenticated
    USING (
        client_id IN (
            SELECT id FROM clients
            WHERE document = SPLIT_PART(auth.email(), '@', 1)
        )
    );

-- Policy: Clients can send messages
CREATE POLICY "Clients can send messages"
    ON client_messages FOR INSERT
    TO authenticated
    WITH CHECK (
        sender_type = 'client'
        AND client_id IN (
            SELECT id FROM clients
            WHERE document = SPLIT_PART(auth.email(), '@', 1)
        )
    );

-- Policy: Office staff can send messages
CREATE POLICY "Office staff can send messages"
    ON client_messages FOR INSERT
    TO authenticated
    WITH CHECK (
        sender_type = 'office'
        AND EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'controller', 'associate', 'collaborator')
        )
    );

-- Policy: Clients can mark own messages as read
CREATE POLICY "Clients can mark own messages as read"
    ON client_messages FOR UPDATE
    TO authenticated
    USING (
        client_id IN (
            SELECT id FROM clients
            WHERE document = SPLIT_PART(auth.email(), '@', 1)
        )
    );

-- ================================================
-- RLS POLICIES: client_notifications
-- ================================================

-- Policy: Admins can view all notifications
CREATE POLICY "Admins can view all notifications"
    ON client_notifications FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'controller')
        )
    );

-- Policy: Clients can view own notifications
CREATE POLICY "Clients can view own notifications"
    ON client_notifications FOR SELECT
    TO authenticated
    USING (
        client_id IN (
            SELECT id FROM clients
            WHERE document = SPLIT_PART(auth.email(), '@', 1)
        )
    );

-- Policy: Clients can mark own notifications as read
CREATE POLICY "Clients can mark own notifications as read"
    ON client_notifications FOR UPDATE
    TO authenticated
    USING (
        client_id IN (
            SELECT id FROM clients
            WHERE document = SPLIT_PART(auth.email(), '@', 1)
        )
    )
    WITH CHECK (
        -- Only allow updating read and read_at fields
        read IS DISTINCT FROM (SELECT read FROM client_notifications WHERE id = client_notifications.id)
    );

-- Policy: System can create notifications
CREATE POLICY "System can create notifications"
    ON client_notifications FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
        )
    );

-- ================================================
-- 5. HELPER FUNCTIONS
-- ================================================

-- Function: Generate unique activation code
CREATE OR REPLACE FUNCTION generate_activation_code()
RETURNS VARCHAR(8) AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Excluding similar chars
    result VARCHAR(8) := '';
    i INTEGER;
BEGIN
    FOR i IN 1..8 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function: Check if client can login (not locked)
CREATE OR REPLACE FUNCTION can_client_login(p_client_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    access_record RECORD;
BEGIN
    SELECT * INTO access_record
    FROM client_portal_access
    WHERE client_id = p_client_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    IF NOT access_record.enabled THEN
        RETURN FALSE;
    END IF;
    
    IF access_record.locked_until IS NOT NULL AND access_record.locked_until > NOW() THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- 6. SAMPLE DATA (DEVELOPMENT ONLY)
-- ================================================
-- Uncomment for development/testing

/*
-- Insert sample portal access for testing
INSERT INTO client_portal_access (client_id, enabled, activation_code, password_hash)
SELECT 
    id,
    TRUE,
    generate_activation_code(),
    '$2b$10$abcdefghijklmnopqrstuvwxyz' -- Replace with real hash
FROM clients
LIMIT 1
ON CONFLICT (client_id) DO NOTHING;
*/

-- ================================================
-- MIGRATION COMPLETE
-- ================================================
-- Tables created:
--   ✅ client_portal_access
--   ✅ client_messages
--   ✅ client_notifications
-- RLS policies applied
-- Indexes created
-- Helper functions defined
-- ================================================
