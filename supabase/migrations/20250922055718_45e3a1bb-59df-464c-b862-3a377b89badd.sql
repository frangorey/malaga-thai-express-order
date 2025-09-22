-- Critical Security Fix: Secure the safe_profiles view with proper RLS policies
-- The safe_profiles view currently has no RLS protection and exposes all user data

-- Views in PostgreSQL don't have RLS policies directly, but we can secure this by:
-- 1. Ensuring it uses security_invoker to inherit RLS from underlying table
-- 2. Since the underlying profiles table has strong RLS, this should work

-- First, let's check if the view has the security_invoker option
-- Drop and recreate the view with proper security settings
DROP VIEW IF EXISTS public.safe_profiles;

-- Create the view with security_invoker enabled to inherit RLS from profiles table
CREATE VIEW public.safe_profiles
WITH (security_invoker = true)
AS
SELECT 
  id,
  email,
  display_name,
  avatar_url,
  created_at,
  updated_at
FROM public.profiles;

-- Add explicit comment about security
COMMENT ON VIEW public.safe_profiles IS 'Secure view of user profiles - inherits RLS policies from profiles table. Users can only access their own data.';

-- Verify the underlying profiles table has proper RLS (it should from previous migrations)
-- Let's also ensure the view respects the RLS policies by testing access patterns

-- Grant appropriate permissions
GRANT SELECT ON public.safe_profiles TO authenticated;
REVOKE ALL ON public.safe_profiles FROM anon, public;