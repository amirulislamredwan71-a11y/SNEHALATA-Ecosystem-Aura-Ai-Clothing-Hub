import { createClient } from "@supabase/supabase-js";

// Vite এর এনভায়রনমেন্ট ভেরিয়েবল থেকে ক্রেডেনশিয়াল সংগ্রহ
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * সুপাবেস কনফিগারেশন চেক
 */
export const isSupabaseConfigured = () => {
    return !!supabaseUrl && !!supabaseAnonKey;
};

// ডাটাবেস ক্লায়েন্ট ইনিশিয়ালাইজেশন
export const supabase = isSupabaseConfigured()
    ? createClient(supabaseUrl!, supabaseAnonKey!)
    : null;

/**
 * ভেন্ডর রিকোয়েস্ট সাবমিট করা (Real-time Audit Ready)
 */
export const submitVendorRequest = async (vendorData: any) => {
    if (!supabase) {
        console.warn("Aura System: Supabase not configured. Using Neural Mock Storage.");
        // নেটওয়ার্ক ল্যাটেন্সি সিমুলেশন
        await new Promise((resolve) => setTimeout(resolve, 1500));
        return {
            data: { ...vendorData, id: "MOCK-" + Math.floor(Math.random() * 10000) },
            error: null,
        };
    }

    try {
        const { data, error } = await supabase
            .from("vendors")
            .insert([vendorData])
            .select();
        
        return { data, error };
    } catch (err) {
        return { data: null, error: err };
    }
};

/**
 * রিয়েল-টাইম ডাটা লিসেনার (Real-time Sync)
 * এটি আপনার সাইটের প্রোডাক্ট বা অর্ডারে পরিবর্তন হলে সাথে সাথে UI আপডেট করবে।
 */
export const subscribeToRealtime = (tableName: string, callback: (payload: any) => void) => {
    if (!supabase) return null;

    return supabase
        .channel(`public:${tableName}`)
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: tableName },
            (payload) => {
                console.log(`Real-time update in ${tableName}:`, payload);
                callback(payload);
            }
        )
        .subscribe();
};

/**
 * স্পেসিফিক টেবিল ডাটা ফেচিং (Helper)
 */
export const fetchLiveTableData = async (tableName: string) => {
    if (!supabase) return { data: [], error: "Supabase not connected" };
    return await supabase.from(tableName).select("*").order('created_at', { ascending: false });
};