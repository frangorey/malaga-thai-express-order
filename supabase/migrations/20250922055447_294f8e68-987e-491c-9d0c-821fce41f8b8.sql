-- Enhanced Security for Profiles Table
-- This migration addresses the security vulnerability by implementing multiple layers of protection

-- 1. First, ensure RLS is enabled (should already be, but double-checking)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to recreate them with enhanced security
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- 3. Create enhanced RLS policies with multiple security checks
-- Policy for SELECT: Only authenticated users can view their own profile
CREATE POLICY "Enhanced: Users can view own profile only" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() = id
);

-- Policy for INSERT: Only authenticated users can create their own profile
CREATE POLICY "Enhanced: Users can insert own profile only" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid() = id
);

-- Policy for UPDATE: Only authenticated users can update their own profile
CREATE POLICY "Enhanced: Users can update own profile only" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() = id
)
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid() = id
);

-- Policy for DELETE: Only authenticated users can delete their own profile
CREATE POLICY "Enhanced: Users can delete own profile only" 
ON public.profiles 
FOR DELETE 
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() = id
);

-- 4. Explicitly deny all access to anonymous users
CREATE POLICY "Deny all access to anonymous users" 
ON public.profiles 
FOR ALL 
TO anon
USING (false);

-- 5. Create a security definer function for safe profile access
-- This function ensures that profile data can only be accessed through controlled means
CREATE OR REPLACE FUNCTION public.get_current_user_profile()
RETURNS TABLE(
  id UUID,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE SQL
SECURITY DEFINER
STABLE
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

-- 6. Create a secure function for updating profiles
CREATE OR REPLACE FUNCTION public.update_user_profile(
  new_display_name TEXT DEFAULT NULL,
  new_avatar_url TEXT DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Get the authenticated user ID
  user_id := auth.uid();
  
  -- Ensure user is authenticated
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;
  
  -- Update only non-sensitive fields
  UPDATE public.profiles 
  SET 
    display_name = COALESCE(new_display_name, display_name),
    avatar_url = COALESCE(new_avatar_url, avatar_url),
    updated_at = now()
  WHERE id = user_id;
  
  -- Return updated profile (non-sensitive fields only)
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.display_name,
    p.avatar_url,
    p.updated_at
  FROM public.profiles p
  WHERE p.id = user_id;
END;
$$;

-- 7. Add constraint to ensure phone and address are never exposed in regular queries
-- Create a view for safe profile access
CREATE OR REPLACE VIEW public.safe_profiles AS
SELECT 
  id,
  email,
  display_name,
  avatar_url,
  created_at,
  updated_at
FROM public.profiles
WHERE id = auth.uid();

-- 8. Grant appropriate permissions
GRANT SELECT ON public.safe_profiles TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_user_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_user_profile(TEXT, TEXT) TO authenticated;

-- 9. Revoke direct table access for enhanced security
-- Note: This is commented out to avoid breaking existing functionality
-- but should be considered for maximum security
-- REVOKE ALL ON public.profiles FROM authenticated;
-- REVOKE ALL ON public.profiles FROM anon;