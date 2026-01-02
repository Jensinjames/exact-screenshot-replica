-- Create team membership system and apply consistent RLS across all tables
-- This migration creates the team_memberships table, has_team_access() function,
-- and applies team-based access control to all sensitive business tables

-- =====================
-- TEAM MEMBERSHIP SYSTEM
-- =====================

-- Create enum for team roles
CREATE TYPE public.team_role AS ENUM ('admin', 'member');

-- Create team_memberships table
CREATE TABLE public.team_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role team_role NOT NULL DEFAULT 'member',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

-- Enable RLS on team_memberships
ALTER TABLE public.team_memberships ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check team access
-- This prevents infinite recursion when used in RLS policies
CREATE OR REPLACE FUNCTION public.has_team_access()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.team_memberships
    WHERE user_id = auth.uid()
  )
$$;

-- Allow team members to view team_memberships
CREATE POLICY "Team members can view team memberships"
  ON public.team_memberships FOR SELECT TO authenticated
  USING (public.has_team_access());

-- Only admins can manage team memberships
CREATE OR REPLACE FUNCTION public.is_team_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.team_memberships
    WHERE user_id = auth.uid() AND role = 'admin'
  )
$$;

CREATE POLICY "Admins can manage team memberships"
  ON public.team_memberships FOR ALL TO authenticated
  USING (public.is_team_admin())
  WITH CHECK (public.is_team_admin());

-- =====================
-- UPDATE handle_new_user TO AUTO-ADD FIRST USER AS ADMIN
-- =====================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  
  -- Auto-add first user as admin (solves bootstrap problem)
  IF NOT EXISTS (SELECT 1 FROM public.team_memberships LIMIT 1) THEN
    INSERT INTO public.team_memberships (user_id, role)
    VALUES (NEW.id, 'admin');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =====================
-- CUSTOMERS TABLE
-- =====================
DROP POLICY IF EXISTS "Team members can create customers" ON public.customers;
DROP POLICY IF EXISTS "Team members can delete customers" ON public.customers;
DROP POLICY IF EXISTS "Team members can update customers" ON public.customers;
DROP POLICY IF EXISTS "Team members can view all customers" ON public.customers;

CREATE POLICY "Team members can manage customers"
  ON public.customers FOR ALL TO authenticated
  USING (public.has_team_access())
  WITH CHECK (public.has_team_access());

-- =====================
-- ORDERS TABLE
-- =====================
DROP POLICY IF EXISTS "Team members can create orders" ON public.orders;
DROP POLICY IF EXISTS "Team members can delete orders" ON public.orders;
DROP POLICY IF EXISTS "Team members can update orders" ON public.orders;
DROP POLICY IF EXISTS "Team members can view all orders" ON public.orders;

CREATE POLICY "Team members can manage orders"
  ON public.orders FOR ALL TO authenticated
  USING (public.has_team_access())
  WITH CHECK (public.has_team_access());

-- =====================
-- ORDER_ITEMS TABLE
-- =====================
DROP POLICY IF EXISTS "Team members can create order items" ON public.order_items;
DROP POLICY IF EXISTS "Team members can delete order items" ON public.order_items;
DROP POLICY IF EXISTS "Team members can update order items" ON public.order_items;
DROP POLICY IF EXISTS "Team members can view all order items" ON public.order_items;

CREATE POLICY "Team members can manage order_items"
  ON public.order_items FOR ALL TO authenticated
  USING (public.has_team_access())
  WITH CHECK (public.has_team_access());

-- =====================
-- PRODUCTS TABLE
-- =====================
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
DROP POLICY IF EXISTS "Team members can manage products" ON public.products;

CREATE POLICY "Team members can manage products"
  ON public.products FOR ALL TO authenticated
  USING (public.has_team_access())
  WITH CHECK (public.has_team_access());

-- =====================
-- INVENTORY TABLE
-- =====================
DROP POLICY IF EXISTS "Team members can manage inventory" ON public.inventory;
DROP POLICY IF EXISTS "Team members can view inventory" ON public.inventory;

CREATE POLICY "Team members can manage inventory"
  ON public.inventory FOR ALL TO authenticated
  USING (public.has_team_access())
  WITH CHECK (public.has_team_access());

-- =====================
-- PRODUCTION_PLANS TABLE
-- =====================
DROP POLICY IF EXISTS "Team members can manage production plans" ON public.production_plans;
DROP POLICY IF EXISTS "Team members can view production plans" ON public.production_plans;

CREATE POLICY "Team members can manage production_plans"
  ON public.production_plans FOR ALL TO authenticated
  USING (public.has_team_access())
  WITH CHECK (public.has_team_access());