import { createServerClient } from '@supabase/ssr';

export async function createClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          try {
            const { cookies } = await import('next/headers');
            const cookieStore = await cookies();
            return cookieStore.getAll();
          } catch {
            // Return empty array if in static generation
            return [];
          }
        },
        async setAll(cookiesToSet) {
          try {
            const { cookies } = await import('next/headers');
            const cookieStore = await cookies();
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Silently fail if in static generation
            return;
          }
        },
      },
      global: {
        // Add fetch with error handling to catch network issues
        fetch: async (url, options = {}) => {
          try {
            const res = await fetch(url, { ...options, cache: 'no-store' });
            return res;
          } catch (error) {
            console.error('Fetch error:', error);
            throw error;
          }
        }
      }
    }
  );
}
