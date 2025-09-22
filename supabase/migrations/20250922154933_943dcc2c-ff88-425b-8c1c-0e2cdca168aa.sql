-- Fix security vulnerability: Drop unsafe view and replace with secure function
-- The safe_profiles view was exposing all profile data without RLS protection

-- Drop the unsafe view
DROP VIEW IF EXISTS public.safe_profiles;

-- Create a secure function that respects RLS and only returns current user's data
CREATE OR REPLACE FUNCTION public.get_safe_profiles()
RETURNS TABLE(
  id uuid,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
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