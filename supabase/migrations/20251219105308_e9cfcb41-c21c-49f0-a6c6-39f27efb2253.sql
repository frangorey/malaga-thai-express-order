-- Drop the conflicting RESTRICTIVE policy that blocks all access for anon users
-- This is unnecessary because the existing authenticated-only policies already properly restrict access
DROP POLICY IF EXISTS "Deny all access to anonymous users" ON public.profiles;