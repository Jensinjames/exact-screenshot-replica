-- Add team role support for order item RLS enforcement
DO $$
BEGIN
  CREATE TYPE public.team_role AS ENUM ('admin', 'member');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.team_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.team_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.team_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view their own membership"
  ON public.team_memberships FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Admins can manage team memberships"
  ON public.team_memberships FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.team_memberships tm
      WHERE tm.user_id = auth.uid()
        AND tm.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.team_memberships tm
      WHERE tm.user_id = auth.uid()
        AND tm.role = 'admin'
    )
  );

-- Helper to centralize membership-based access checks
CREATE OR REPLACE FUNCTION public.has_team_access()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.team_memberships tm
    WHERE tm.user_id = auth.uid()
      AND tm.role IN ('admin', 'member')
  );
$$;

-- Tighten order_items policies to require team membership
DROP POLICY IF EXISTS "Team members can view all order items" ON public.order_items;
DROP POLICY IF EXISTS "Team members can create order items" ON public.order_items;
DROP POLICY IF EXISTS "Team members can update order items" ON public.order_items;
DROP POLICY IF EXISTS "Team members can delete order items" ON public.order_items;

CREATE POLICY "Team members can view order items"
ON public.order_items
FOR SELECT TO authenticated
USING (public.has_team_access());

CREATE POLICY "Team members can create order items"
ON public.order_items
FOR INSERT TO authenticated
WITH CHECK (public.has_team_access());

CREATE POLICY "Team members can update order items"
ON public.order_items
FOR UPDATE TO authenticated
USING (public.has_team_access())
WITH CHECK (public.has_team_access());

CREATE POLICY "Team members can delete order items"
ON public.order_items
FOR DELETE TO authenticated
USING (public.has_team_access());
