import { createClient } from '@supabase/supabase-js';

// Supabase URL and Keys
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

/**
 * Client-side Supabase client (uses anon key)
 * Use this in client components and browser contexts
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Server-side Supabase client (uses service key)
 * Use this in API routes and server components for admin operations
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Database Types
 */
export interface Profile {
    id: string;
    created_at: string;
    updated_at: string;
    display_name?: string;
    avatar_url?: string;
    wind_universe_id: string;
    wind_type?: string;
    current_phase: number;
}

export interface Conversation {
    id: number;
    created_at: string;
    user_id: string;
    role: 'wenjing' | 'hanchuan' | 'yeli' | 'user';
    type: 'text' | 'audio';
    content?: string;
    audio_url?: string;
    wind_phase?: number;
    metadata?: Record<string, any>;
}

export interface ScheduledTask {
    id: number;
    created_at: string;
    user_id: string;
    text: string;
    voice_id: string;
    run_at: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    audio_url?: string;
    error_message?: string;
    metadata?: Record<string, any>;
}
