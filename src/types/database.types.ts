// Generated types for Supabase database schema
export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            clients: {
                Row: {
                    id: string
                    name: string
                    email: string | null
                    phone: string | null
                    whatsapp: string | null
                    document: string
                    client_type: 'individual' | 'company'
                    photo_url: string | null
                    address: string | null
                    notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    email?: string | null
                    phone?: string | null
                    whatsapp?: string | null
                    document: string
                    client_type: 'individual' | 'company'
                    photo_url?: string | null
                    address?: string | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    email?: string | null
                    phone?: string | null
                    whatsapp?: string | null
                    document?: string
                    client_type?: 'individual' | 'company'
                    photo_url?: string | null
                    address?: string | null
                    notes?: string | null
                    updated_at?: string
                }
            }
            processes: {
                Row: {
                    id: string
                    process_number: string
                    client_id: string | null
                    tribunal_id: string
                    tribunal_name: string
                    case_id: string | null
                    class_name: string | null
                    subject: string[] | null
                    filing_date: string | null
                    court_name: string | null
                    status: string
                    case_value: number | null
                    last_movement_date: string | null
                    imported_from_datajud: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    process_number: string
                    client_id?: string | null
                    tribunal_id: string
                    tribunal_name: string
                    case_id?: string | null
                    class_name?: string | null
                    subject?: string[] | null
                    filing_date?: string | null
                    court_name?: string | null
                    status?: string
                    case_value?: number | null
                    last_movement_date?: string | null
                    imported_from_datajud?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    process_number?: string
                    client_id?: string | null
                    tribunal_id?: string
                    tribunal_name?: string
                    case_id?: string | null
                    class_name?: string | null
                    subject?: string[] | null
                    filing_date?: string | null
                    court_name?: string | null
                    status?: string
                    case_value?: number | null
                    last_movement_date?: string | null
                    updated_at?: string
                }
            }

            movements: {
                Row: {
                    id: string
                    process_id: string
                    movement_date: string
                    movement_type: string | null
                    description: string
                    comments: string[] | null
                    shared_with_client: boolean
                    client_friendly_summary: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    process_id: string
                    movement_date: string
                    movement_type?: string | null
                    description: string
                    comments?: string[] | null
                    shared_with_client?: boolean
                    client_friendly_summary?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    process_id?: string
                    movement_date?: string
                    movement_type?: string | null
                    description?: string
                    comments?: string[] | null
                    shared_with_client?: boolean
                    client_friendly_summary?: string | null
                }
            }
            cases: {
                Row: {
                    id: string
                    client_id: string | null
                    case_status: 'initial_consultation' | 'case' | 'contracted' | 'process'
                    contact_name: string
                    contact_phone: string | null
                    initial_notes: string
                    consultation_date: string
                    evolved_to_contract_at: string | null
                    evolved_to_process_at: string | null
                    process_id: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    client_id?: string | null
                    case_status?: 'initial_consultation' | 'case' | 'contracted' | 'process'
                    contact_name: string
                    contact_phone?: string | null
                    initial_notes: string
                    consultation_date?: string
                    evolved_to_contract_at?: string | null
                    evolved_to_process_at?: string | null
                    process_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    client_id?: string | null
                    case_status?: 'initial_consultation' | 'case' | 'contracted' | 'process'
                    contact_name?: string
                    contact_phone?: string | null
                    initial_notes?: string
                    consultation_date?: string
                    evolved_to_contract_at?: string | null
                    evolved_to_process_at?: string | null
                    process_id?: string | null
                    updated_at?: string
                }
            }
            documents: {
                Row: {
                    id: string
                    process_id: string | null
                    client_id: string | null
                    title: string
                    document_type: string
                    file_url: string
                    file_size: number | null
                    uploaded_at: string
                }
                Insert: {
                    id?: string
                    process_id?: string | null
                    client_id?: string | null
                    title: string
                    document_type: string
                    file_url: string
                    file_size?: number | null
                    uploaded_at?: string
                }
                Update: {
                    id?: string
                    process_id?: string | null
                    client_id?: string | null
                    title?: string
                    document_type?: string
                    file_url?: string
                    file_size?: number | null
                }
            }
            notifications: {
                Row: {
                    id: string
                    user_id: string
                    process_id: string | null
                    notification_type: 'movement' | 'deadline' | 'publication'
                    title: string
                    message: string
                    sent_via_email: boolean
                    sent_via_whatsapp: boolean
                    read_at: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    process_id?: string | null
                    notification_type: 'movement' | 'deadline' | 'publication'
                    title: string
                    message: string
                    sent_via_email?: boolean
                    sent_via_whatsapp?: boolean
                    read_at?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    process_id?: string | null
                    notification_type?: 'movement' | 'deadline' | 'publication'
                    title?: string
                    message?: string
                    sent_via_email?: boolean
                    sent_via_whatsapp?: boolean
                    read_at?: string | null
                }
            }
            client_messages: {
                Row: {
                    id: string
                    client_id: string
                    title: string
                    message: string
                    direction: 'from_client' | 'to_client'
                    read: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    client_id: string
                    title: string
                    message: string
                    direction: 'from_client' | 'to_client'
                    read?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    client_id?: string
                    title?: string
                    message?: string
                    direction?: 'from_client' | 'to_client'
                    read?: boolean
                    created_at?: string
                }
            }
            user_settings: {
                Row: {
                    user_id: string
                    notifications_email: boolean
                    notifications_whatsapp: boolean
                    auto_update_processes: boolean
                    update_frequency_minutes: number
                    whatsapp_number: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    user_id: string
                    notifications_email?: boolean
                    notifications_whatsapp?: boolean
                    auto_update_processes?: boolean
                    update_frequency_minutes?: number
                    whatsapp_number?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    user_id?: string
                    notifications_email?: boolean
                    notifications_whatsapp?: boolean
                    auto_update_processes?: boolean
                    update_frequency_minutes?: number
                    whatsapp_number?: string | null
                    updated_at?: string
                }
            }
            gamification_profiles: {
                Row: {
                    user_id: string
                    current_level: number
                    current_xp: number
                    total_points_all_time: number
                    total_points_year: number
                    streak_days: number
                    last_activity_date: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    user_id: string
                    current_level?: number
                    current_xp?: number
                    total_points_all_time?: number
                    total_points_year?: number
                    streak_days?: number
                    last_activity_date?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    user_id?: string
                    current_level?: number
                    current_xp?: number
                    total_points_all_time?: number
                    total_points_year?: number
                    streak_days?: number
                    last_activity_date?: string | null
                    updated_at?: string
                }
            }
            gamification_events: {
                Row: {
                    id: string
                    user_id: string
                    event_type: string
                    points: number
                    metadata: Json | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    event_type: string
                    points: number
                    metadata?: Json | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    event_type?: string
                    points?: number
                    metadata?: Json | null
                }
            }
            medals: {
                Row: {
                    id: string
                    code: string
                    name: string
                    description: string
                    icon_name: string
                    rarity: 'common' | 'rare' | 'epic' | 'legendary'
                    xp_reward: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    code: string
                    name: string
                    description: string
                    icon_name: string
                    rarity: 'common' | 'rare' | 'epic' | 'legendary'
                    xp_reward?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    code?: string
                    name?: string
                    description?: string
                    icon_name?: string
                    rarity?: 'common' | 'rare' | 'epic' | 'legendary'
                    xp_reward?: number
                }
            }
            user_medals: {
                Row: {
                    id: string
                    user_id: string
                    medal_id: string
                    earned_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    medal_id: string
                    earned_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    medal_id?: string
                    earned_at?: string
                }
            }
            goals: {
                Row: {
                    id: string
                    user_id: string
                    goal_type: 'weekly' | 'monthly'
                    description: string
                    target_value: number
                    current_value: number
                    status: 'active' | 'completed' | 'failed'
                    start_date: string
                    end_date: string
                    reward_xp: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    goal_type: 'weekly' | 'monthly'
                    description: string
                    target_value: number
                    current_value?: number
                    status?: 'active' | 'completed' | 'failed'
                    start_date: string
                    end_date: string
                    reward_xp: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    goal_type?: 'weekly' | 'monthly'
                    description?: string
                    target_value?: number
                    current_value?: number
                    status?: 'active' | 'completed' | 'failed'
                    start_date?: string
                    end_date?: string
                    reward_xp?: number
                    updated_at?: string
                }
            }
            services: {
                Row: {
                    id: string
                    title: string
                    client_id: string | null
                    client_name: string | null
                    service_type: string
                    status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
                    priority: 'low' | 'medium' | 'high' | 'urgent'
                    description: string | null
                    deadline: string | null
                    assigned_to: string | null
                    tags: string[] | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    client_id?: string | null
                    client_name?: string | null
                    service_type: string
                    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
                    priority?: 'low' | 'medium' | 'high' | 'urgent'
                    description?: string | null
                    deadline?: string | null
                    assigned_to?: string | null
                    tags?: string[] | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    client_id?: string | null
                    client_name?: string | null
                    service_type?: string
                    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
                    priority?: 'low' | 'medium' | 'high' | 'urgent'
                    description?: string | null
                    deadline?: string | null
                    assigned_to?: string | null
                    tags?: string[] | null
                    updated_at?: string
                }
            }
            agenda_events: {
                Row: {
                    id: string
                    title: string
                    description: string | null
                    event_type: 'hearing' | 'meeting' | 'deadline' | 'consultation' | 'other'
                    start_date: string
                    start_time: string
                    end_time: string
                    location: string | null
                    client_id: string | null
                    process_id: string | null
                    status: 'scheduled' | 'completed' | 'canceled'
                    reminder_minutes: number | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    description?: string | null
                    event_type: 'hearing' | 'meeting' | 'deadline' | 'consultation' | 'other'
                    start_date: string
                    start_time: string
                    end_time: string
                    location?: string | null
                    client_id?: string | null
                    process_id?: string | null
                    status?: 'scheduled' | 'completed' | 'canceled'
                    reminder_minutes?: number | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    description?: string | null
                    event_type?: 'hearing' | 'meeting' | 'deadline' | 'consultation' | 'other'
                    start_date?: string
                    start_time?: string
                    end_time?: string
                    location?: string | null
                    client_id?: string | null
                    process_id?: string | null
                    status?: 'scheduled' | 'completed' | 'canceled'
                    reminder_minutes?: number | null
                    updated_at?: string
                }
            }
            financial_entries: {
                Row: {
                    id: string
                    entry_type: 'income' | 'expense'
                    amount: number
                    category: string
                    description: string
                    payment_method: string | null
                    entry_date: string
                    client_id: string | null
                    process_id: string | null
                    status: 'pending' | 'paid' | 'overdue'
                    invoice_number: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    entry_type: 'income' | 'expense'
                    amount: number
                    category: string
                    description: string
                    payment_method?: string | null
                    entry_date: string
                    client_id?: string | null
                    process_id?: string | null
                    status?: 'pending' | 'paid' | 'overdue'
                    invoice_number?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    entry_type?: 'income' | 'expense'
                    amount?: number
                    category?: string
                    description?: string
                    payment_method?: string | null
                    entry_date?: string
                    client_id?: string | null
                    process_id?: string | null
                    status?: 'pending' | 'paid' | 'overdue'
                    invoice_number?: string | null
                    updated_at?: string
                }
            }
            flowcharts: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    type: string
                    active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    type?: string
                    active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    type?: string
                    active?: boolean
                    updated_at?: string
                }
            }
            flow_steps: {
                Row: {
                    id: string
                    flowchart_id: string
                    name: string
                    description: string | null
                    order: number
                    deadline_days: number
                    responsible_role: string | null
                    is_mandatory: boolean
                    checklist: string[] | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    flowchart_id: string
                    name: string
                    description?: string | null
                    order: number
                    deadline_days?: number
                    responsible_role?: string | null
                    is_mandatory?: boolean
                    checklist?: string[] | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    flowchart_id?: string
                    name?: string
                    description?: string | null
                    order?: number
                    deadline_days?: number
                    responsible_role?: string | null
                    is_mandatory?: boolean
                    checklist?: string[] | null
                }
            }
            process_flow_states: {
                Row: {
                    id: string
                    process_id: string
                    flowchart_id: string
                    current_step_id: string | null
                    status: string
                    started_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    process_id: string
                    flowchart_id: string
                    current_step_id?: string | null
                    status?: string
                    started_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    process_id?: string
                    flowchart_id?: string
                    current_step_id?: string | null
                    status?: string
                    started_at?: string
                    updated_at?: string
                }
            }
            flow_history: {
                Row: {
                    id: string
                    process_id: string
                    from_step_id: string | null
                    to_step_id: string | null
                    user_id: string | null
                    user_name: string | null
                    comments: string | null
                    timestamp: string
                }
                Insert: {
                    id?: string
                    process_id: string
                    from_step_id?: string | null
                    to_step_id?: string | null
                    user_id?: string | null
                    user_name?: string | null
                    comments?: string | null
                    timestamp?: string
                }
                Update: {
                    id?: string
                    process_id?: string
                    from_step_id?: string | null
                    to_step_id?: string | null
                    user_id?: string | null
                    user_name?: string | null
                    comments?: string | null
                    timestamp?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}
