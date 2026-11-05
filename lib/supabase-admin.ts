import { createClient } from "@supabase/supabase-js";

// Server-only client with the secret service_role key: it ignores row-level security, so it is used
// ONLY for changes users must not make themselves (status, results, usage log) AFTER the route has
// checked who the user is and that the recording is theirs. Never import this from a "use client" file.
export function createAdminSupabase() {
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing");
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {auth: {persistSession: false, autoRefreshToken: false}});
}
