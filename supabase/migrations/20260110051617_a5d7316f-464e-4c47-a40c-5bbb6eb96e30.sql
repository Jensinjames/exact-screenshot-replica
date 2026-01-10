-- Drop the overly permissive policy that allows any authenticated user to view all profiles
-- This ensures only team members can view profiles via the existing restrictive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;