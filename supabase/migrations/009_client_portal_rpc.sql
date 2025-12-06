-- ================================================
-- CLIENT PORTAL - RPC FUNCTIONS
-- ================================================
-- Functions for secure client activation without exposing tables
-- Version: 1.0
-- Date: 2025-11-30
-- ================================================

-- Function: Verify Activation Code
-- Returns true if code matches and account is ready for activation
CREATE OR REPLACE FUNCTION verify_activation_code(p_cpf TEXT, p_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of creator (admin)
AS $$
DECLARE
    v_client_id UUID;
    v_access_record RECORD;
BEGIN
    -- 1. Find client ID by CPF
    SELECT id INTO v_client_id
    FROM clients
    WHERE document = regexp_replace(p_cpf, '\D', '', 'g'); -- Normalize CPF

    IF v_client_id IS NULL THEN
        RETURN FALSE;
    END IF;

    -- 2. Check access record
    SELECT * INTO v_access_record
    FROM client_portal_access
    WHERE client_id = v_client_id;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    -- 3. Verify conditions
    IF v_access_record.activation_code = p_code 
       AND v_access_record.enabled = TRUE 
       AND v_access_record.first_access_completed = FALSE THEN
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$;

-- Function: Complete Activation
-- Marks first access as completed and clears activation code
CREATE OR REPLACE FUNCTION complete_activation(p_cpf TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_client_id UUID;
BEGIN
    -- 1. Find client ID
    SELECT id INTO v_client_id
    FROM clients
    WHERE document = regexp_replace(p_cpf, '\D', '', 'g');

    IF v_client_id IS NULL THEN
        RAISE EXCEPTION 'Cliente não encontrado';
    END IF;

    -- 2. Update record
    UPDATE client_portal_access
    SET 
        first_access_completed = TRUE,
        activation_code = NULL, -- Clear code for security
        updated_at = NOW()
    WHERE client_id = v_client_id;
END;
$$;
