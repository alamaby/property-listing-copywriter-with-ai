'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';

export async function claimDailyCredit() {
  const supabase = await createClient();

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: "Authentication required" };
  }

  const userId = user.id;
  const now = new Date();

  // Calculate expiration time (24 hours from now)
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  // Atomic insert — the partial unique index
  // (idx_daily_claim_per_user_per_day) prevents duplicate daily claims.
  // If the user already claimed today, this will throw a unique violation.
  const { error: insertError } = await supabase
    .from('credit_transactions')
    .insert({
      user_id: userId,
      amount: 1,
      transaction_type: 'DAILY_CLAIM',
      expires_at: expiresAt.toISOString()
    });

  if (insertError) {
    // 23505 = unique_violation (already claimed today)
    if (insertError.code === '23505') {
      return { error: "Already claimed today" };
    }
    return { error: "Failed to claim credit" };
  }

  // Revalidate dashboard path
  revalidatePath('/dashboard');

  return { success: true, message: "Daily credit claimed successfully!" };
}
