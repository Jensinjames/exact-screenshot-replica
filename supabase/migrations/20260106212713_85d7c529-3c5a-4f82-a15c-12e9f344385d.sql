-- Add restrictive RLS policy for signup_attempts
-- This table is only accessed by SECURITY DEFINER functions, so no direct access needed
CREATE POLICY "No direct access to signup_attempts"
ON public.signup_attempts
FOR ALL
USING (false)
WITH CHECK (false);