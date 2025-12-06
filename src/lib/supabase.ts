import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Strict validation to prevent using placeholder credentials
const isValidUrl = (url: string | undefined): boolean => {
    if (!url) return false;
    return url.startsWith('https://') &&
        !url.includes('your-project') &&
        !url.includes('placeholder') &&
        !url.includes('example');
};

const isConfigured = isValidUrl(supabaseUrl) && !!supabaseAnonKey;

if (!isConfigured) {
    console.warn('⚠️ Supabase credentials not found or invalid. Using local storage fallback.');
}

// Create Supabase client
export const supabase = isConfigured
    ? createClient<any>(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
        },
        db: {
            schema: 'public'
        },
        global: {
            headers: {
                'X-Client-Info': 'vob-mandakaru-web'
            }
        }
    })
    : null;

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => !!supabase;

// Export types for better TypeScript support
export type SupabaseClient = typeof supabase;
