'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function claimDailyCredit() {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: "Authentication required" };
  }

  const userId = user.id;
  
  // Get start of today in UTC
  const now = new Date();
  const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  
  // Check if user already claimed today
  const { count, error: queryError } = await supabase
    .from('credit_transactions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('transaction_type', 'DAILY_CLAIM')
    .gte('created_at', startOfToday.toISOString());

  if (queryError && queryError.code !== 'PGRST116') {
    return { error: "Failed to check claim status" };
  }

  if (count && count > 0) {
    return { error: "Already claimed today" };
  }

  // Calculate expiration time (24 hours from now)
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  // Insert new daily claim transaction
  const { error: insertError } = await supabase
    .from('credit_transactions')
    .insert({
      user_id: userId,
      amount: 1,
      transaction_type: 'DAILY_CLAIM',
      expires_at: expiresAt.toISOString()
    });

  if (insertError) {
    return { error: "Failed to claim credit" };
  }

  // Revalidate dashboard path
  revalidatePath('/dashboard');
  
  return { success: true, message: "Daily credit claimed successfully!" };
}