-- Allow authenticated users to insert their own DAILY_CLAIM transactions
CREATE POLICY "Users can insert daily claims"
    ON public.credit_transactions FOR INSERT
    WITH CHECK (
        auth.uid() = user_id AND
        transaction_type = 'DAILY_CLAIM'
    );
