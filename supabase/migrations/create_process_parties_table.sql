-- Migration: Create process_parties table for multi-client support
-- This allows multiple clients per process (N:M relationship)
-- Run this in Supabase SQL Editor

-- 1. Create process_parties table
CREATE TABLE IF NOT EXISTS process_parties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    process_id UUID NOT NULL REFERENCES processes(id) ON DELETE CASCADE,
    
    -- Party information
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('plaintiff', 'defendant', 'third_party')),
    type TEXT NOT NULL CHECK (type IN ('individual', 'company')),
    document TEXT,  -- CPF/CNPJ
    
    -- Client relationship
    is_client BOOLEAN DEFAULT FALSE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    
    -- Additional metadata
    lawyer_oab TEXT,
    lawyer_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_party_per_process UNIQUE (process_id, name, role)
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_process_parties_process_id ON process_parties(process_id);
CREATE INDEX IF NOT EXISTS idx_process_parties_client_id ON process_parties(client_id);
CREATE INDEX IF NOT EXISTS idx_process_parties_is_client ON process_parties(is_client);
CREATE INDEX IF NOT EXISTS idx_process_parties_document ON process_parties(document);

-- 3. Enable Row Level Security
ALTER TABLE process_parties ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies (users can only see parties of processes they have access to)
CREATE POLICY "Users can view parties of accessible processes"
    ON process_parties
    FOR SELECT
    USING (
        process_id IN (
            SELECT id FROM processes
            WHERE auth.uid() = user_id OR is_public = TRUE
        )
    );

CREATE POLICY "Users can insert parties for their processes"
    ON process_parties
    FOR INSERT
    WITH CHECK (
        process_id IN (
            SELECT id FROM processes WHERE auth.uid() = user_id
        )
    );

CREATE POLICY "Users can update parties of their processes"
    ON process_parties
    FOR UPDATE
    USING (
        process_id IN (
            SELECT id FROM processes WHERE auth.uid() = user_id
        )
    );

CREATE POLICY "Users can delete parties of their processes"
    ON process_parties
    FOR DELETE
    USING (
        process_id IN (
            SELECT id FROM processes WHERE auth.uid() = user_id
        )
    );

-- 5. Create updated_at trigger
CREATE OR REPLACE FUNCTION update_process_parties_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER process_parties_updated_at
    BEFORE UPDATE ON process_parties
    FOR EACH ROW
    EXECUTE FUNCTION update_process_parties_updated_at();

-- 6. Comments for documentation
COMMENT ON TABLE process_parties IS 'Stores all parties (plaintiff, defendant, third party) for each process, allowing multiple clients per process';
COMMENT ON COLUMN process_parties.is_client IS 'TRUE if this party is a client of the law firm';
COMMENT ON COLUMN process_parties.client_id IS 'Foreign key to clients table if is_client=TRUE';
COMMENT ON COLUMN process_parties.role IS 'Party role: plaintiff (autor), defendant (réu), or third_party (terceiro interessado)';

-- 7. Optional: Migrate existing data from processes table
-- WARNING: Run this carefully - it will attempt to extract plaintiff/defendant from existing processes
-- and create corresponding party records

-- Extract plaintiffs from existing processes
INSERT INTO process_parties (process_id, name, role, is_client, client_id, type)
SELECT 
    p.id as process_id,
    COALESCE(
        p.folder->'basicData'->>'plaintiff',
        'Nome não informado'
    ) as name,
    'plaintiff' as role,
    TRUE as is_client,
    p.client_id,
    CASE 
        WHEN c.type = 'company' THEN 'company'
        ELSE 'individual'
    END as type
FROM processes p
LEFT JOIN clients c ON p.client_id = c.id
WHERE p.folder->'basicData'->>'plaintiff' IS NOT NULL
    AND p.folder->'basicData'->>'plaintiff' != ''
ON CONFLICT (process_id, name, role) DO NOTHING;

-- Extract defendants from existing processes
INSERT INTO process_parties (process_id, name, role, type)
SELECT 
    p.id as process_id,
    COALESCE(
        p.folder->'basicData'->>'defendant',
        'Nome não informado'
    ) as name,
    'defendant' as role,
    'individual' as type  -- Default, can be updated later
FROM processes p
WHERE p.folder->'basicData'->>'defendant' IS NOT NULL
    AND p.folder->'basicData'->>'defendant' != ''
    AND p.folder->'basicData'->>'defendant' != 'Nome não informado'
ON CONFLICT (process_id, name, role) DO NOTHING;

-- 8. Create view for easy querying of process clients
CREATE OR REPLACE VIEW process_clients AS
SELECT 
    pp.process_id,
    pp.client_id,
    c.name as client_name,
    c.document as client_document,
    pp.role as client_role,
    pp.name as party_name
FROM process_parties pp
INNER JOIN clients c ON pp.client_id = c.id
WHERE pp.is_client = TRUE;

COMMENT ON VIEW process_clients IS 'View showing all clients associated with each process through process_parties';
