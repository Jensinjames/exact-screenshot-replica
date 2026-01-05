-- Update handle_new_user to validate invitation token from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  invitation_record RECORD;
  v_full_name TEXT;
  v_invitation_token UUID;
BEGIN
  -- Validate and sanitize full_name from metadata
  v_full_name := NULLIF(TRIM(NEW.raw_user_meta_data ->> 'full_name'), '');
  
  -- Apply length limit
  IF v_full_name IS NOT NULL AND LENGTH(v_full_name) > 255 THEN
    v_full_name := LEFT(v_full_name, 255);
  END IF;
  
  -- Get invitation token from user metadata (passed during signup)
  v_invitation_token := NULLIF(NEW.raw_user_meta_data ->> 'invitation_token', '')::UUID;
  
  -- Create profile with sanitized name
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, v_full_name);
  
  -- Check for valid invitation WITH token validation
  -- Only match if token is provided and matches
  IF v_invitation_token IS NOT NULL THEN
    SELECT * INTO invitation_record
    FROM public.team_invitations
    WHERE email = NEW.email
      AND token = v_invitation_token
      AND accepted_at IS NULL
      AND expires_at > now()
    LIMIT 1;
    
    IF FOUND THEN
      -- Accept invitation and add to team
      INSERT INTO public.team_memberships (user_id, role)
      VALUES (NEW.id, invitation_record.role);
      
      UPDATE public.team_invitations
      SET accepted_at = now()
      WHERE id = invitation_record.id;
    END IF;
  ELSIF NOT EXISTS (SELECT 1 FROM public.team_memberships LIMIT 1) THEN
    -- First user becomes admin (bootstrap) - only when no token and no existing members
    INSERT INTO public.team_memberships (user_id, role)
    VALUES (NEW.id, 'admin');
  END IF;
  
  RETURN NEW;
END;
$function$;