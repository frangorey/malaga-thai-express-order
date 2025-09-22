-- Fix security vulnerability in safe_profiles table
-- Add Row Level Security policies to protect customer personal information

-- Enable RLS on safe_profiles table
ALTER TABLE public.safe_profiles ENABLE ROW LEVEL SECURITY;

-- Policy to deny all access to anonymous users
CREATE POLICY "Deny all access to anonymous users" 
ON public.safe_profiles 
FOR ALL 
USING (false);

-- Policy for users to view only their own profile
CREATE POLICY "Users can view own profile only" 
ON public.safe_profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND auth.uid() = id);

-- Policy for users to update only their own profile
CREATE POLICY "Users can update own profile only" 
ON public.safe_profiles 
FOR UPDATE 
USING (auth.uid() IS NOT NULL AND auth.uid() = id)
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = id);

-- Policy for users to insert only their own profile
CREATE POLICY "Users can insert own profile only" 
ON public.safe_profiles 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = id);

-- Policy for users to delete only their own profile
CREATE POLICY "Users can delete own profile only" 
ON public.safe_profiles 
FOR DELETE 
USING (auth.uid() IS NOT NULL AND auth.uid() = id);