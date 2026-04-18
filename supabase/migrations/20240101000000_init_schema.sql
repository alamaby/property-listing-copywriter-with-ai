-- 1. Create Enums
CREATE TYPE public.user_role AS ENUM ('ADMIN', 'USER');
CREATE TYPE public.user_tier AS ENUM ('FREE', 'PRO', 'ENTERPRISE');
CREATE TYPE public.transaction_type AS ENUM ('EARN', 'USAGE', 'EXPIRED', 'WELCOME_BONUS', 'REFUND');

-- 2. Create Profiles Table
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    role public.user_role DEFAULT 'USER'::public.user_role NOT NULL,
    tier public.user_tier DEFAULT 'FREE'::public.user_tier NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Create Credit Transactions Table (Ledger System)
CREATE TABLE public.credit_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    amount INTEGER NOT NULL,
    transaction_type public.transaction_type NOT NULL,
    reference_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMPTZ
);

-- 4. Create LLM Logs Table
CREATE TABLE public.llm_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    property_context JSONB,
    model_used TEXT NOT NULL,
    request_payload JSONB,
    response_payload JSONB,
    prompt_tokens INTEGER,
    completion_tokens INTEGER,
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.llm_logs ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS Policies

-- Drop existing policies to ensure a clean state
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own transactions" ON public.credit_transactions;
DROP POLICY IF EXISTS "Users can view own logs" ON public.llm_logs;

-- Helper function to check if user is admin without causing recursion
-- We use SECURITY DEFINER to bypass RLS on the profiles table
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
    -- Check if the current user has 'ADMIN' role in the profiles table
    -- This query bypasses RLS because the function is SECURITY DEFINER
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'ADMIN'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Profiles: 
-- 1. Users can read their own profile
CREATE POLICY "Users can view own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

-- 2. Admins can read all profiles (using the helper function)
CREATE POLICY "Admins can view all profiles" 
    ON public.profiles FOR SELECT 
    USING (public.is_admin());

-- Credit Transactions: Users can read their own transactions. Admins can read all.
CREATE POLICY "Users can view own transactions" 
    ON public.credit_transactions FOR SELECT 
    USING (
        auth.uid() = user_id OR 
        public.is_admin()
    );

-- LLM Logs: Users can read their own logs. Admins can read all.
CREATE POLICY "Users can view own logs" 
    ON public.llm_logs FOR SELECT 
    USING (
        auth.uid() = user_id OR 
        public.is_admin()
    );

-- 7. Trigger: Auto-Profile & Welcome Bonus for New Users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    -- Insert profile
    INSERT INTO public.profiles (id, full_name, role, tier)
    VALUES (new.id, new.raw_user_meta_data->>'full_name', 'USER', 'FREE');

    -- Insert 3 Welcome Credits
    INSERT INTO public.credit_transactions (user_id, amount, transaction_type)
    VALUES (new.id, 3, 'WELCOME_BONUS');

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
