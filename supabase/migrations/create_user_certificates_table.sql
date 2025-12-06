-- Create table for storing user certificates
-- Run this in Supabase SQL editor

CREATE TABLE IF NOT EXISTS user_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Certificate Information (unencrypted metadata)
    subject TEXT NOT NULL,
    issuer TEXT NOT NULL,
    serial_number TEXT NOT NULL,
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_to TIMESTAMP WITH TIME ZONE NOT NULL,
    cpf_cnpj TEXT NOT NULL,
    email TEXT,
    organization TEXT,
    
    -- Encrypted certificate data
    encrypted_data TEXT NOT NULL,  -- JSON string with { salt, iv, data }
    
    -- Timestamps
    stored_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one certificate per user
    CONSTRAINT unique_user_certificate UNIQUE (user_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_user_certificates_user_id ON user_certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_user_certificates_valid_to ON user_certificates(valid_to);
CREATE INDEX IF NOT EXISTS idx_user_certificates_cpf_cnpj ON user_certificates(cpf_cnpj);

-- Enable Row Level Security (RLS)
ALTER TABLE user_certificates ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own certificates
CREATE POLICY "Users can view own certificates"
    ON user_certificates
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own certificates"
    ON user_certificates
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own certificates"
    ON user_certificates
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own certificates"
    ON user_certificates
    FOR DELETE
    USING (auth.uid() = user_id);

-- Comments for documentation
COMMENT ON TABLE user_certificates IS 'Stores encrypted A1 digital certificates for users';
COMMENT ON COLUMN user_certificates.encrypted_data IS 'AES-256-GCM encrypted certificate data (PKCS#12) stored as JSON with salt, iv, and encrypted blob';
COMMENT ON COLUMN user_certificates.cpf_cnpj IS 'CPF or CNPJ extracted from certificate for quick identification';
