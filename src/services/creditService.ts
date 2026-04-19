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
  },

  /**
   * Fetches all credit transaction history for a specific user, ordered by creation date descending.
   * @param userId The UUID of the user
   * @returns Array of credit transaction records
   */
  async getCreditHistory(userId: string): Promise<any[]> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching credit history:', JSON.stringify(error, null, 2));
      return [];
    }

    return data || [];
  }
};