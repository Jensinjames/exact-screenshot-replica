-- Add missing constraints (avoiding duplicates)

-- Customers: add not_empty check (name_length already exists)
ALTER TABLE public.customers
  ADD CONSTRAINT customers_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
  ADD CONSTRAINT customers_notes_length CHECK (notes IS NULL OR LENGTH(notes) <= 5000),
  ADD CONSTRAINT customers_address_length CHECK (address IS NULL OR LENGTH(address) <= 500);

-- Inventory: add name and unit constraints
ALTER TABLE public.inventory
  ADD CONSTRAINT inventory_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
  ADD CONSTRAINT inventory_name_length CHECK (LENGTH(name) <= 255),
  ADD CONSTRAINT inventory_unit_not_empty CHECK (LENGTH(TRIM(unit)) > 0),
  ADD CONSTRAINT inventory_unit_length CHECK (LENGTH(unit) <= 50);

-- Orders: add not_empty check (customer_name_length already exists)
ALTER TABLE public.orders
  ADD CONSTRAINT orders_customer_name_not_empty CHECK (LENGTH(TRIM(customer_name)) > 0),
  ADD CONSTRAINT orders_notes_length CHECK (notes IS NULL OR LENGTH(notes) <= 5000);

-- Products: add name constraints
ALTER TABLE public.products
  ADD CONSTRAINT products_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
  ADD CONSTRAINT products_name_length CHECK (LENGTH(name) <= 255);

-- Profiles: add avatar_url_length (full_name_length already exists)
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_avatar_url_length CHECK (avatar_url IS NULL OR LENGTH(avatar_url) <= 2048);

-- Production plans: add notes constraint
ALTER TABLE public.production_plans
  ADD CONSTRAINT production_plans_notes_length CHECK (notes IS NULL OR LENGTH(notes) <= 5000);

-- Fix DEFINER_OR_RPC_BYPASS: Update handle_new_user() with input validation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invitation_record RECORD;
  v_full_name TEXT;
BEGIN
  -- Validate and sanitize full_name from metadata
  v_full_name := NULLIF(TRIM(NEW.raw_user_meta_data ->> 'full_name'), '');
  
  -- Apply length limit
  IF v_full_name IS NOT NULL AND LENGTH(v_full_name) > 255 THEN
    v_full_name := LEFT(v_full_name, 255);
  END IF;
  
  -- Create profile with sanitized name
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, v_full_name);
  
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
$$;