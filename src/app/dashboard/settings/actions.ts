'use server';

import { createClient } from '@/lib/supabase/server';
import { creditService } from '@/services/creditService';

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
      id: data.id as string,
      fullName: data.full_name || "",
      language: data.language || "en",
      timezone: data.timezone || "UTC",
      defaultSignature: data.default_signature || "",
      defaultWritingStyle: data.default_writing_style || "formal",
      tier: (data.tier as string) || "FREE",
    };
  } catch (error) {
    console.error('Unexpected error in getProfileData:', error);
    return null;
  }
}

export async function getCreditTransactions() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return [];
    return await creditService.getCreditHistory(user.id);
  } catch (error) {
    console.error('Unexpected error in getCreditTransactions:', error);
    return [];
  }
}