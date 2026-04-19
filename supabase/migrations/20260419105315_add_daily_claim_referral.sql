-- Migration: Add DAILY_CLAIM and REFERRAL_BONUS transaction types, referral system, and update user creation logic

-- 1. Add new values to transaction_type enum
-- Note: In Postgres, we can safely add values to an enum with ALTER TYPE
ALTER TYPE public.transaction_type ADD VALUE IF NOT EXISTS 'DAILY_CLAIM';
ALTER TYPE public.transaction_type ADD VALUE IF NOT EXISTS 'REFERRAL_BONUS';

-- 2. Add referred_by column to profiles table
-- This creates a self-referential foreign key for the referral system
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.profiles(id);

-- 3. Update the handle_new_user function to support referral bonuses
-- The function now extracts referred_by from raw_user_meta_data and grants referral bonuses
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    referred_by_id UUID;
BEGIN
    -- Extract referred_by from raw_user_meta_data
    referred_by_id := (new.raw_user_meta_data->>'referred_by')::UUID;
    
    -- Insert profile with referred_by
    INSERT INTO public.profiles (id, full_name, role, tier, referred_by)
    VALUES (new.id, new.raw_user_meta_data->>'full_name', 'USER', 'FREE', referred_by_id);
    
    -- Insert 3 Welcome Credits for all new users
    INSERT INTO public.credit_transactions (user_id, amount, transaction_type)
    VALUES (new.id, 3, 'WELCOME_BONUS');
    
    -- Referral Bonus Logic
    -- If the new user was referred by someone (referred_by is valid and exists)
    IF referred_by_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.profiles WHERE id = referred_by_id) THEN
        -- Grant 5 credits to the new user (REFERRAL_BONUS)
        INSERT INTO public.credit_transactions (user_id, amount, transaction_type)
        VALUES (new.id, 5, 'REFERRAL_BONUS');
        
        -- Grant 5 credits to the referrer (REFERRAL_BONUS)
        INSERT INTO public.credit_transactions (user_id, amount, transaction_type)
        VALUES (referred_by_id, 5, 'REFERRAL_BONUS');
    END IF;
    
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: The trigger 'on_auth_user_created' already exists and calls handle_new_user,
-- so we don't need to recreate it. The function replacement is sufficient.