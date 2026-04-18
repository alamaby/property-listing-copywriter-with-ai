-- 1. Drop existing policies to ensure a clean state
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own transactions" ON public.credit_transactions;
DROP POLICY IF EXISTS "Users can view own logs" ON public.llm_logs;

-- 2. Helper function to check if user is admin without causing recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'ADMIN'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Profiles: Split into two policies to avoid recursion
-- Users can read their own profile (simple check)
CREATE POLICY "Users can view own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

-- Admins can read all profiles (uses helper)
CREATE POLICY "Admins can view all profiles" 
    ON public.profiles FOR SELECT 
    USING (public.is_admin());

-- 4. Credit Transactions: Users can read their own transactions. Admins can read all.
CREATE POLICY "Users can view own transactions" 
    ON public.credit_transactions FOR SELECT 
    USING (
        auth.uid() = user_id OR 
        public.is_admin()
    );

-- 5. LLM Logs: Users can read their own logs. Admins can read all.
CREATE POLICY "Users can view own logs" 
    ON public.llm_logs FOR SELECT 
    USING (
        auth.uid() = user_id OR 
        public.is_admin()
    );
