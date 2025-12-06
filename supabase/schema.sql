-- VOB Alaska Database Schema
-- Execute this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CLIENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    whatsapp TEXT,
    document TEXT NOT NULL,
    client_type TEXT NOT NULL CHECK (client_type IN ('individual', 'company')),
    photo_url TEXT,
    address TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- CASES TABLE (Atendimentos/Consultas)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    case_status TEXT NOT NULL DEFAULT 'initial_consultation' 
        CHECK (case_status IN ('initial_consultation', 'case', 'contracted', 'process')),
    contact_name TEXT NOT NULL,
    contact_phone TEXT,
    initial_notes TEXT NOT NULL,
    consultation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    evolved_to_contract_at TIMESTAMP WITH TIME ZONE,
    evolved_to_process_at TIMESTAMP WITH TIME ZONE,
    process_id UUID, -- Will reference processes table
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PROCESSES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.processes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    process_number TEXT NOT NULL UNIQUE,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    tribunal_id TEXT NOT NULL,
    tribunal_name TEXT NOT NULL,
    case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
    class_name TEXT,
    subject TEXT[],
    filing_date DATE,
    court_name TEXT,
    status TEXT DEFAULT 'active',
    case_value DECIMAL,
    last_movement_date TIMESTAMP WITH TIME ZONE,
    imported_from_datajud BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key to cases table for process_id
ALTER TABLE public.cases 
    ADD CONSTRAINT cases_process_id_fkey 
    FOREIGN KEY (process_id) 
    REFERENCES public.processes(id) 
    ON DELETE SET NULL;

-- ============================================================================
-- MOVEMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    process_id UUID NOT NULL REFERENCES public.processes(id) ON DELETE CASCADE,
    movement_date TIMESTAMP WITH TIME ZONE NOT NULL,
    movement_type TEXT,
    description TEXT NOT NULL,
    comments TEXT[],
    shared_with_client BOOLEAN DEFAULT false,
    client_friendly_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- DOCUMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    process_id UUID REFERENCES public.processes(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    document_type TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    process_id UUID REFERENCES public.processes(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('movement', 'deadline', 'publication')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    sent_via_email BOOLEAN DEFAULT false,
    sent_via_whatsapp BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- USER SETTINGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_settings (
    user_id UUID PRIMARY KEY,
    notifications_email BOOLEAN DEFAULT true,
    notifications_whatsapp BOOLEAN DEFAULT false,
    auto_update_processes BOOLEAN DEFAULT true,
    update_frequency_minutes INTEGER DEFAULT 60,
    whatsapp_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- GAMIFICATION TABLES
-- ============================================================================

-- 1. Gamification Profiles (Stores user stats)
CREATE TABLE IF NOT EXISTS public.gamification_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id),
    current_level INTEGER DEFAULT 1,
    current_xp INTEGER DEFAULT 0,
    total_points_all_time INTEGER DEFAULT 0,
    total_points_year INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    last_activity_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Gamification Events (Log of all point-generating actions)
CREATE TABLE IF NOT EXISTS public.gamification_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    event_type TEXT NOT NULL, -- e.g., 'PROCESS_CREATED', 'TASK_COMPLETED'
    points INTEGER NOT NULL,
    metadata JSONB, -- Stores related entity ID (process_id, client_id, etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Medals (Definitions)
CREATE TABLE IF NOT EXISTS public.medals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE, -- e.g., 'FIRST_PROCESS', 'PROCESS_MASTER'
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_name TEXT NOT NULL, -- Name of the icon to render
    rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    xp_reward INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. User Medals (Achievements)
CREATE TABLE IF NOT EXISTS public.user_medals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    medal_id UUID NOT NULL REFERENCES public.medals(id),
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, medal_id)
);

-- 5. Goals (Weekly/Monthly targets)
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    goal_type TEXT NOT NULL CHECK (goal_type IN ('weekly', 'monthly')),
    description TEXT NOT NULL,
    target_value INTEGER NOT NULL,
    current_value INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reward_xp INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES for better performance
-- ============================================================================

-- Clients indexes
CREATE INDEX IF NOT EXISTS idx_clients_document ON public.clients(document);
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);

-- Processes indexes
CREATE INDEX IF NOT EXISTS idx_processes_number ON public.processes(process_number);
CREATE INDEX IF NOT EXISTS idx_processes_client_id ON public.processes(client_id);
CREATE INDEX IF NOT EXISTS idx_processes_case_id ON public.processes(case_id);
CREATE INDEX IF NOT EXISTS idx_processes_status ON public.processes(status);
CREATE INDEX IF NOT EXISTS idx_processes_last_movement ON public.processes(last_movement_date DESC);

-- Movements indexes
CREATE INDEX IF NOT EXISTS idx_movements_process_id ON public.movements(process_id);
CREATE INDEX IF NOT EXISTS idx_movements_date ON public.movements(movement_date DESC);

-- Cases indexes
CREATE INDEX IF NOT EXISTS idx_cases_client_id ON public.cases(client_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON public.cases(case_status);
CREATE INDEX IF NOT EXISTS idx_cases_process_id ON public.cases(process_id);

-- Documents indexes
CREATE INDEX IF NOT EXISTS idx_documents_process_id ON public.documents(process_id);
CREATE INDEX IF NOT EXISTS idx_documents_client_id ON public.documents(client_id);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_process_id ON public.notifications(process_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON public.notifications(read_at);

-- Gamification indexes
CREATE INDEX IF NOT EXISTS idx_gamification_events_user_id ON public.gamification_events(user_id);
CREATE INDEX IF NOT EXISTS idx_gamification_events_created_at ON public.gamification_events(created_at);
CREATE INDEX IF NOT EXISTS idx_user_medals_user_id ON public.user_medals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_id_status ON public.goals(user_id, status);

-- ============================================================================
-- TRIGGERS for updated_at timestamps
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_processes_updated_at BEFORE UPDATE ON public.processes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON public.cases
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gamification_profiles_updated_at BEFORE UPDATE ON public.gamification_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON public.goals
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) Policies
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Gamification RLS
ALTER TABLE public.gamification_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_medals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Policies: Allow authenticated users to access their own data
-- Note: Adjust these based on your multi-user requirements

CREATE POLICY "Users can view all clients" ON public.clients
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert clients" ON public.clients
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update clients" ON public.clients
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete clients" ON public.clients
    FOR DELETE USING (auth.role() = 'authenticated');

-- Similar policies for other tables
CREATE POLICY "Users can manage processes" ON public.processes
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage movements" ON public.movements
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage cases" ON public.cases
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage documents" ON public.documents
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage their notifications" ON public.notifications
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their settings" ON public.user_settings
    FOR ALL USING (auth.uid() = user_id);

-- Gamification Policies
CREATE POLICY "Users can view their own gamification profile" ON public.gamification_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own gamification profile" ON public.gamification_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own gamification events" ON public.gamification_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert gamification events" ON public.gamification_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Everyone can view medals" ON public.medals
    FOR SELECT USING (true);

CREATE POLICY "Users can view their own medals" ON public.user_medals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own medals" ON public.user_medals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their goals" ON public.goals
    FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- SAMPLE DATA for testing (Optional - comment out in production)
-- ============================================================================

-- Insert a sample client
-- INSERT INTO public.clients (name, document, client_type, email, phone)
-- VALUES ('João Silva', '123.456.789-00', 'individual', 'joao@example.com', '(11) 98765-4321');

COMMENT ON TABLE public.clients IS 'Cadastro de clientes (pessoas físicas e jurídicas)';
COMMENT ON TABLE public.processes IS 'Processos judiciais importados do DataJud ou inseridos manualmente';
COMMENT ON TABLE public.movements IS 'Movimentações processuais com comentários e resumos para clientes';
COMMENT ON TABLE public.cases IS 'Atendimentos, consultas e casos que podem evoluir para processos';
COMMENT ON TABLE public.documents IS 'Documentos vinculados a processos ou clientes';
COMMENT ON TABLE public.notifications IS 'Notificações enviadas aos usuários';
COMMENT ON TABLE public.user_settings IS 'Configurações de notificações e preferências do usuário';

-- Gamification Comments
COMMENT ON TABLE public.gamification_profiles IS 'Perfil de gamificação do usuário (nível, xp, pontos)';
COMMENT ON TABLE public.gamification_events IS 'Log de eventos que geram pontos';
COMMENT ON TABLE public.medals IS 'Definição das medalhas disponíveis no sistema';
COMMENT ON TABLE public.user_medals IS 'Medalhas conquistadas pelos usuários';
COMMENT ON TABLE public.goals IS 'Metas semanais e mensais dos usuários';

-- ============================================================================
-- FLOWCHART TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.flowcharts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    type TEXT DEFAULT 'unique', -- 'unique', 'legal_area', 'case_type', 'client'
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.flow_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flowchart_id UUID NOT NULL REFERENCES public.flowcharts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    "order" INTEGER NOT NULL,
    deadline_days INTEGER DEFAULT 0,
    responsible_role TEXT,
    is_mandatory BOOLEAN DEFAULT true,
    checklist TEXT[], -- Array of strings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.process_flow_states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    process_id UUID NOT NULL REFERENCES public.processes(id) ON DELETE CASCADE,
    flowchart_id UUID NOT NULL REFERENCES public.flowcharts(id) ON DELETE CASCADE,
    current_step_id UUID REFERENCES public.flow_steps(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'active', -- 'active', 'completed', 'paused'
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.flow_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    process_id UUID NOT NULL REFERENCES public.processes(id) ON DELETE CASCADE,
    from_step_id UUID REFERENCES public.flow_steps(id) ON DELETE SET NULL,
    to_step_id UUID REFERENCES public.flow_steps(id) ON DELETE SET NULL,
    user_id TEXT, -- Can be UUID or 'system'
    user_name TEXT,
    comments TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Flowchart Indexes
CREATE INDEX IF NOT EXISTS idx_flow_steps_flowchart_id ON public.flow_steps(flowchart_id);
CREATE INDEX IF NOT EXISTS idx_process_flow_states_process_id ON public.process_flow_states(process_id);
CREATE INDEX IF NOT EXISTS idx_flow_history_process_id ON public.flow_history(process_id);

-- Flowchart RLS
ALTER TABLE public.flowcharts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.process_flow_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flow_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view flowcharts" ON public.flowcharts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can manage flowcharts" ON public.flowcharts FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view flow steps" ON public.flow_steps FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can manage flow steps" ON public.flow_steps FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view flow states" ON public.process_flow_states FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can manage flow states" ON public.process_flow_states FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view flow history" ON public.flow_history FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can manage flow history" ON public.flow_history FOR ALL USING (auth.role() = 'authenticated');

COMMENT ON TABLE public.flowcharts IS 'Definição de fluxogramas de processos';
COMMENT ON TABLE public.flow_steps IS 'Etapas de um fluxograma';
COMMENT ON TABLE public.process_flow_states IS 'Estado atual de um processo dentro de um fluxo';
COMMENT ON TABLE public.flow_history IS 'Histórico de movimentações entre etapas';
