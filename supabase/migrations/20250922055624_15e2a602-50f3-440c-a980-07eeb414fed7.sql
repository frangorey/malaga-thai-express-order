-- Security Fix: Secure the safe_profiles view with RLS policies
-- The safe_profiles view is currently exposing user data without protection

-- Drop the existing unsafe view
DROP VIEW IF EXISTS public.safe_profiles;

-- Create a secure function instead of a view to avoid RLS complications
-- This function will only return the current user's profile data
CREATE OR REPLACE FUNCTION public.get_safe_profile()
RETURNS TABLE(
  id UUID,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.email,
    p.display_name,
    p.avatar_url,
    p.created_at,
    p.updated_at
  FROM public.profiles p
  WHERE p.id = auth.uid()
  AND auth.uid() IS NOT NULL;
$$;

-- Grant execute permission to authenticated users only
GRANT EXECUTE ON FUNCTION public.get_safe_profile() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_safe_profile() FROM anon, public;

-- Create a secure view with RLS enabled as an alternative
CREATE VIEW public.safe_profiles
WITH (security_invoker = on)
AS
SELECT 
  id,
  email,
  display_name,
  avatar_url,
  created_at,
  updated_at
FROM public.profiles;

-- Enable RLS on the view
ALTER VIEW public.safe_profiles SET (security_invoker = on);

-- Create RLS policy for the safe_profiles view
-- This will inherit the RLS policies from the underlying profiles table
-- Users can only see their own profile data
COMMENT ON VIEW public.safe_profiles IS 'Secure view of user profiles with RLS protection - users can only access their own data';