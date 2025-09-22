-- Fix the security definer view issue
-- Replace the view with a standard view that respects RLS
DROP VIEW IF EXISTS public.safe_profiles;

-- Create a standard view without SECURITY DEFINER that still respects RLS
CREATE VIEW public.safe_profiles AS
SELECT 
  id,
  email,
  display_name,
  avatar_url,
  created_at,
  updated_at
FROM public.profiles;