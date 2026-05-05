-- Add profile default columns: timezone, language, signature, writing style.
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Asia/Jakarta',
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'id',
ADD COLUMN IF NOT EXISTS default_signature TEXT,
ADD COLUMN IF NOT EXISTS default_writing_style TEXT DEFAULT 'Professional';

-- RLS: allow users to update their own profile settings.
DROP POLICY IF EXISTS "Users can update own profile defaults" ON public.profiles;
CREATE POLICY "Users can update own profile defaults"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);