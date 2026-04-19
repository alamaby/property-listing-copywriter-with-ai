'use server';

import { createClient } from '@/lib/supabase/server';

/**
 * Fetches the current user's profile data from the database
 * Uses server-side Supabase client to ensure proper authentication
 * @returns Profile data or null if not found
 */
export async function getProfileData() {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return null;
    }
    
    // Fetch profile data using server client which has proper auth session
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (error) {
      console.error('Error fetching profile data:', error);
      return null;
    }
    
    return {
      fullName: data.full_name || "",
      language: data.language || "en",
      timezone: data.timezone || "UTC",
      defaultSignature: data.default_signature || "",
      defaultWritingStyle: data.default_writing_style || "formal"
    };
  } catch (error) {
    console.error('Unexpected error in getProfileData:', error);
    return null;
  }
}