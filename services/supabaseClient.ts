
import { createClient } from '@supabase/supabase-js';

// Get credentials from environment variables
// Fix: Use process.env as defined in vite.config.ts instead of import.meta.env to avoid property 'env' does not exist on 'ImportMeta' error
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = () => {
    return !!supabaseUrl && !!supabaseAnonKey;
}

// Initialize Supabase only if keys exist, otherwise return null to trigger mock mode
export const supabase = isSupabaseConfigured() 
  ? createClient(supabaseUrl!, supabaseAnonKey!) 
  : null;

/**
 * Submits vendor request to Supabase or simulates it if not configured.
 */
export const submitVendorRequest = async (vendorData: any) => {
    if (!supabase) {
        console.warn("Aura System: Supabase not configured. Using Neural Mock Storage.");
        // Simulate network latency
        await new Promise(resolve => setTimeout(resolve, 1500));
        return { 
            data: { ...vendorData, id: 'MOCK-' + Math.floor(Math.random() * 10000) }, 
            error: null 
        };
    }

    return await supabase
        .from('vendors')
        .insert([vendorData])
        .select();
};
