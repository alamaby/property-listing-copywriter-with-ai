'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function updateProfile(profileData: {
  name?: string;
  timezone?: string;
  language?: string;
  defaultSignature?: string;
  defaultWritingStyle?: string;
}) {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: "Authentication required" };
  }

  const updates = {
    ...(profileData.name !== undefined && { full_name: profileData.name }),
    ...(profileData.timezone !== undefined && { timezone: profileData.timezone }),
    ...(profileData.language !== undefined && { language: profileData.language }),
    ...(profileData.defaultSignature !== undefined && { default_signature: profileData.defaultSignature }),
    ...(profileData.defaultWritingStyle !== undefined && { default_writing_style: profileData.defaultWritingStyle })
  };

  // Update profile
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id);

  if (error) {
    return { error: "Failed to update profile" };
  }

  // Revalidate settings page
  revalidatePath('/dashboard/settings');
  
  return { success: true };
}