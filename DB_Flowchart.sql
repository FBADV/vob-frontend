-- DB_Flowchart.sql
-- Database schema for Flowchart Registration Module
-- VOB Alaska - Virtual Office Brazil

-- ============================================
-- Table: flowcharts
-- ============================================
CREATE TABLE IF NOT EXISTS flowcharts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('unique', 'by_legal_area', 'by_case_type', 'by_client')),
    active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_flowcharts_active ON flowcharts(active);
CREATE INDEX idx_flowcharts_type ON flowcharts(type);

COMMENT ON TABLE flowcharts IS 'Stores flowchart definitions created by administrators';
COMMENT ON COLUMN flowcharts.type IS 'Determines flowchart scope: unique (default for all), by_legal_area, by_case_type, by_client';

-- ============================================
-- Table: flow_steps
-- ============================================
CREATE TABLE IF NOT EXISTS flow_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flowchart_id UUID NOT NULL REFERENCES flowcharts(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    step_order INTEGER NOT NULL,
    deadline_days INTEGER,
    responsible_role VARCHAR(50),
    automatic_status VARCHAR(50),
    mandatory BOOLEAN DEFAULT TRUE,
    checklist_json JSONB DEFAULT '[]',
    triggers_json JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(flowchart_id, step_order)
);

CREATE INDEX idx_flow_steps_flowchart ON flow_steps(flowchart_id);
CREATE INDEX idx_flow_steps_order ON flow_steps(flowchart_id, step_order);

COMMENT ON TABLE flow_steps IS 'Individual steps within a flowchart';
COMMENT ON COLUMN flow_steps.checklist_json IS 'JSON array of checklist items for this step';
COMMENT ON COLUMN flow_steps.triggers_json IS 'JSON array of automation triggers (notifications, tasks)';

-- ============================================
-- Table: flow_dependencies
-- ============================================
CREATE TABLE IF NOT EXISTS flow_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    step_id UUID NOT NULL REFERENCES flow_steps(id) ON DELETE CASCADE,
    depends_on_step_id UUID NOT NULL REFERENCES flow_steps(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(step_id, depends_on_step_id),
    CHECK (step_id != depends_on_step_id)
);

CREATE INDEX idx_flow_dependencies_step ON flow_dependencies(step_id);
CREATE INDEX idx_flow_dependencies_depends_on ON flow_dependencies(depends_on_step_id);

COMMENT ON TABLE flow_dependencies IS 'Defines prerequisite relationships between flow steps';

-- ============================================
-- Table: process_flow_state
-- ============================================
CREATE TABLE IF NOT EXISTS process_flow_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    process_id UUID NOT NULL REFERENCES processes(id) ON DELETE CASCADE,
    flowchart_id UUID NOT NULL REFERENCES flowcharts(id),
    current_step_id UUID REFERENCES flow_steps(id),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(process_id)
);

CREATE INDEX idx_process_flow_state_process ON process_flow_state(process_id);
CREATE INDEX idx_process_flow_state_current_step ON process_flow_state(current_step_id);
CREATE INDEX idx_process_flow_state_flowchart ON process_flow_state(flowchart_id);

COMMENT ON TABLE process_flow_state IS 'Tracks current flow state for each process';

-- ============================================
-- Table: flow_history
-- ============================================
CREATE TABLE IF NOT EXISTS flow_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    process_id UUID NOT NULL REFERENCES processes(id) ON DELETE CASCADE,
    from_step_id UUID REFERENCES flow_steps(id),
    to_step_id UUID REFERENCES flow_steps(id),
    user_id UUID REFERENCES auth.users(id),
    notes TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_flow_history_process ON flow_history(process_id);
CREATE INDEX idx_flow_history_timestamp ON flow_history(timestamp DESC);
CREATE INDEX idx_flow_history_user ON flow_history(user_id);

COMMENT ON TABLE flow_history IS 'Audit log of all flow step transitions';

-- ============================================
-- Functions & Triggers
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_flowcharts_updated_at BEFORE UPDATE ON flowcharts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flow_steps_updated_at BEFORE UPDATE ON flow_steps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_process_flow_state_updated_at BEFORE UPDATE ON process_flow_state
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security (RLS)
-- ============================================

ALTER TABLE flowcharts ENABLE ROW LEVEL SECURITY;
ALTER TABLE flow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE flow_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_flow_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE flow_history ENABLE ROW LEVEL SECURITY;

-- Admin can do anything
CREATE POLICY "Admins can manage flowcharts" ON flowcharts
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage flow_steps" ON flow_steps
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Controllers and lawyers can view flowcharts
CREATE POLICY "Users can view flowcharts" ON flowcharts
    FOR SELECT USING (active = TRUE);

CREATE POLICY "Users can view flow_steps" ON flow_steps
    FOR SELECT USING (TRUE);

-- All authenticated users can update process_flow_state (with app-level permission checks)
CREATE POLICY "Users can update process flow state" ON process_flow_state
    FOR UPDATE USING (auth.role() = 'authenticated');

-- All authenticated users can insert flow history
CREATE POLICY "Users can insert flow history" ON flow_history
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can view flow history" ON flow_history
    FOR SELECT USING (TRUE);

-- ============================================
-- Seed Data (Optional)
-- ============================================

-- Example: Default flowchart for all processes
INSERT INTO flowcharts (name, description, type, active) VALUES
    ('Fluxo Padrão', 'Fluxo processual padrão para todos os tipos de processos', 'unique', TRUE)
ON CONFLICT DO NOTHING;

-- Get the flowchart ID (assuming it's the only one or using a known UUID)
DO $$
DECLARE
    v_flowchart_id UUID;
BEGIN
    SELECT id INTO v_flowchart_id FROM flowcharts WHERE name = 'Fluxo Padrão' LIMIT 1;
    
    IF v_flowchart_id IS NOT NULL THEN
        INSERT INTO flow_steps (flowchart_id, name, description, step_order, deadline_days, responsible_role, mandatory) VALUES
            (v_flowchart_id, 'Análise Inicial', 'Análise inicial do caso e documentação', 1, 3, 'lawyer', TRUE),
            (v_flowchart_id, 'Elaboração da Peça', 'Elaboração da petição inicial ou contestação', 2, 7, 'lawyer', TRUE),
            (v_flowchart_id, 'Revisão da Controladoria', 'Revisão e aprovação pela controladoria', 3, 2, 'controller', TRUE),
            (v_flowchart_id, 'Encaminhamento ao Cliente', 'Envio da peça para aprovação do cliente', 4, 3, 'lawyer', TRUE),
            (v_flowchart_id, 'Protocolo', 'Protocolo da petição no tribunal', 5, 1, 'assistant', TRUE),
            (v_flowchart_id, 'Acompanhamento', 'Acompanhamento processual contínuo', 6, NULL, 'lawyer', FALSE),
            (v_flowchart_id, 'Encerramento', 'Finalização e arquivamento do processo', 7, 2, 'controller', TRUE)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

---
-- Document version 1.0 – 2025‑11‑24
