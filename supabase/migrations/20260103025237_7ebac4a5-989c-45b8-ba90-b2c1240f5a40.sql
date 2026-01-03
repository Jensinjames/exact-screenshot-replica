-- Fix Profiles Table RLS (PUBLIC_DATA_EXPOSURE)
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Team members can view profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.has_team_access());

-- Add Database Input Validation Constraints
-- Customers table
ALTER TABLE public.customers
  ADD CONSTRAINT customers_email_format 
    CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  ADD CONSTRAINT customers_name_length 
    CHECK (char_length(name) BETWEEN 1 AND 200),
  ADD CONSTRAINT customers_phone_length 
    CHECK (phone IS NULL OR char_length(phone) <= 30);

-- Profiles table
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_full_name_length 
    CHECK (full_name IS NULL OR char_length(full_name) <= 200);

-- Inventory table
ALTER TABLE public.inventory
  ADD CONSTRAINT inventory_quantity_positive 
    CHECK (quantity >= 0),
  ADD CONSTRAINT inventory_threshold_positive 
    CHECK (low_stock_threshold >= 0);

-- Orders table
ALTER TABLE public.orders
  ADD CONSTRAINT orders_customer_name_length 
    CHECK (char_length(customer_name) BETWEEN 1 AND 200),
  ADD CONSTRAINT orders_total_positive 
    CHECK (total_amount >= 0);

-- Create Team Invitations Table
CREATE TABLE public.team_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  role team_role NOT NULL DEFAULT 'member',
  invited_by uuid REFERENCES auth.users(id),
  token uuid NOT NULL DEFAULT gen_random_uuid(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (email, token),
  CONSTRAINT invitations_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT invitations_email_length CHECK (char_length(email) <= 255)
);

ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- Only admins can manage invitations
CREATE POLICY "Admins can manage invitations"
  ON public.team_invitations FOR ALL TO authenticated
  USING (public.is_team_admin())
  WITH CHECK (public.is_team_admin());

-- Update handle_new_user to check invitations
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  invitation_record RECORD;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  
  -- Check for valid invitation
  SELECT * INTO invitation_record
  FROM public.team_invitations
  WHERE email = NEW.email
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
  ELSIF NOT EXISTS (SELECT 1 FROM public.team_memberships LIMIT 1) THEN
    -- First user becomes admin (bootstrap)
    INSERT INTO public.team_memberships (user_id, role)
    VALUES (NEW.id, 'admin');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;