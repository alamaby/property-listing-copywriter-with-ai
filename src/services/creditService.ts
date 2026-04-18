import { createClient } from '@/utils/supabase/server';

/**
 * Service to handle user credits logic
 */
export const creditService = {
  /**
   * Fetches the sum of all credit transactions for a specific user.
   * @param userId The UUID of the user
   * @returns The total sum of credits
   */
  async getUserCreditBalance(userId: string): Promise<number> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('credit_transactions')
      .select('amount')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching credit balance:', JSON.stringify(error, null, 2));
      return 0;
    }

    const total = (data || []).reduce((sum, transaction) => sum + (transaction.amount || 0), 0);
    return total;
  }
};
