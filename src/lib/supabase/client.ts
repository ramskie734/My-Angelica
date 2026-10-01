import { createBrowserClient } from "@supabase/ssr";

/**
 * Singleton browser Supabase client used by every client component.
 * Configuration comes from environment variables - never hard-code keys.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export const supabase = createClient();
