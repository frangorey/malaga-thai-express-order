-- Security Fix: Enhanced RLS Policies for Profiles Table
-- Step 1: Drop ALL existing policies to start fresh

DO $$ 
DECLARE
    pol RECORD;
BEGIN
    -- Drop all existing policies on profiles table
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
    END LOOP;
END $$;

-- Step 2: Create enhanced security policies

-- Explicitly deny ALL access to anonymous users
CREATE POLICY "Deny all access to anonymous users" 
ON public.profiles 
FOR ALL 
TO anon
USING (false);

-- Enhanced SELECT policy: Only authenticated users can view their own profile
CREATE POLICY "Enhanced: Users can view own profile only" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() = id
);

-- Enhanced INSERT policy: Only authenticated users can create their own profile
CREATE POLICY "Enhanced: Users can insert own profile only" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid() = id
);

-- Enhanced UPDATE policy: Only authenticated users can update their own profile
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

-- Enhanced DELETE policy: Only authenticated users can delete their own profile
CREATE POLICY "Enhanced: Users can delete own profile only" 
ON public.profiles 
FOR DELETE 
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() = id
);