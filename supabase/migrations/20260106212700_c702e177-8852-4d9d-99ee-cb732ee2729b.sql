-- Table to track signup attempts for rate limiting
CREATE TABLE public.signup_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  ip_address TEXT,
  attempted_at TIMESTAMPTZ DEFAULT now(),
  token_provided BOOLEAN DEFAULT false,
  success BOOLEAN DEFAULT false
);

-- Index for efficient lookups
CREATE INDEX idx_signup_attempts_email_time ON public.signup_attempts (email, attempted_at);

-- Enable RLS (table is only accessed by triggers with SECURITY DEFINER)
ALTER TABLE public.signup_attempts ENABLE ROW LEVEL SECURITY;

-- Auto-cleanup old records (keep 24 hours)
CREATE OR REPLACE FUNCTION public.cleanup_old_signup_attempts()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.signup_attempts 
  WHERE attempted_at < now() - INTERVAL '24 hours';
$$;

-- Function to check if signup should be rate limited
-- Returns TRUE if rate limited (should block), FALSE if allowed
CREATE OR REPLACE FUNCTION public.check_signup_rate_limit(
  p_email TEXT,
  p_window_minutes INT DEFAULT 15,
  p_max_attempts INT DEFAULT 5
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  attempt_count INT;
BEGIN
  -- Count recent failed attempts for this email
  SELECT COUNT(*) INTO attempt_count
  FROM public.signup_attempts
  WHERE email = p_email
    AND attempted_at > now() - (p_window_minutes || ' minutes')::INTERVAL
    AND success = false;
  
  RETURN attempt_count >= p_max_attempts;
END;
$$;

-- Update handle_new_user to include rate limiting
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invitation_record RECORD;
  v_full_name TEXT;
  v_invitation_token UUID;
  v_is_rate_limited BOOLEAN;
BEGIN
  -- Validate and sanitize full_name from metadata
  v_full_name := NULLIF(TRIM(NEW.raw_user_meta_data ->> 'full_name'), '');
  
  IF v_full_name IS NOT NULL AND LENGTH(v_full_name) > 255 THEN
    v_full_name := LEFT(v_full_name, 255);
  END IF;
  
  v_invitation_token := NULLIF(NEW.raw_user_meta_data ->> 'invitation_token', '')::UUID;
  
  -- Check rate limit for this email
  v_is_rate_limited := public.check_signup_rate_limit(NEW.email);
  
  -- Log this signup attempt
  INSERT INTO public.signup_attempts (email, token_provided, success)
  VALUES (NEW.email, v_invitation_token IS NOT NULL, NOT v_is_rate_limited);
  
  -- Cleanup old attempts periodically (1% chance per signup)
  IF random() < 0.01 THEN
    PERFORM public.cleanup_old_signup_attempts();
  END IF;
  
  -- Create profile
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, v_full_name);
  
  -- If rate limited, skip invitation processing (user still signs up, just not auto-added to team)
  IF v_is_rate_limited THEN
    RETURN NEW;
  END IF;
  
  -- Process invitation token if provided
  IF v_invitation_token IS NOT NULL THEN
    SELECT * INTO invitation_record
    FROM public.team_invitations
    WHERE email = NEW.email
      AND token = v_invitation_token
      AND accepted_at IS NULL
      AND expires_at > now()
    LIMIT 1;
    
    IF FOUND THEN
      INSERT INTO public.team_memberships (user_id, role)
      VALUES (NEW.id, invitation_record.role);
      
      UPDATE public.team_invitations
      SET accepted_at = now()
      WHERE id = invitation_record.id;
    END IF;
  ELSIF NOT EXISTS (SELECT 1 FROM public.team_memberships LIMIT 1) THEN
    INSERT INTO public.team_memberships (user_id, role)
    VALUES (NEW.id, 'admin');
  END IF;
  
  RETURN NEW;
END;
$$;