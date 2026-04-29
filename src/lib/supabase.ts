import { createBrowserClient } from "@supabase/ssr";

// During Vercel's static-page prerender phase, NEXT_PUBLIC_* env vars are
// not always inlined yet — Supabase's createBrowserClient throws "URL and
// API key are required" and crashes the build. Fall back to placeholders
// so the prerender completes; at real runtime in the browser the inlined
// build-time values take over and the placeholders are never seen.
const PLACEHOLDER_URL = "https://placeholder.supabase.co";
const PLACEHOLDER_KEY = "placeholder-anon-key";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || PLACEHOLDER_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || PLACEHOLDER_KEY
  );
}
