-- Prevent duplicate daily claims per user per day (UTC date boundary).
-- This eliminates the race condition between the check-and-insert in claimDailyCredit.
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_claim_per_user_per_day
ON public.credit_transactions (user_id, (created_at::date))
WHERE transaction_type = 'DAILY_CLAIM';
