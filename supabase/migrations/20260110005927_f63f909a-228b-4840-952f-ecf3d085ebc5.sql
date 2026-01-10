-- Create production_runs table
CREATE TABLE public.production_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_date DATE NOT NULL,
  batch_number TEXT NOT NULL,
  doughs_produced NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  labor_cost NUMERIC DEFAULT 0,
  ingredient_cost NUMERIC DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create production_run_outputs table
CREATE TABLE public.production_run_outputs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id UUID NOT NULL REFERENCES public.production_runs(id) ON DELETE CASCADE,
  size public.cake_size NOT NULL,
  variety public.cake_variety NOT NULL,
  quantity_produced INTEGER NOT NULL DEFAULT 0,
  quantity_sold INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.production_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_run_outputs ENABLE ROW LEVEL SECURITY;

-- RLS policies for production_runs
CREATE POLICY "Team members can manage production_runs"
ON public.production_runs
FOR ALL
USING (has_team_access())
WITH CHECK (has_team_access());

-- RLS policies for production_run_outputs
CREATE POLICY "Team members can manage production_run_outputs"
ON public.production_run_outputs
FOR ALL
USING (has_team_access())
WITH CHECK (has_team_access());

-- Trigger for updated_at
CREATE TRIGGER update_production_runs_updated_at
BEFORE UPDATE ON public.production_runs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate batch numbers
CREATE OR REPLACE FUNCTION public.generate_batch_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  next_number INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(batch_number FROM 4) AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.production_runs
  WHERE batch_number LIKE 'PR-%';
  
  NEW.batch_number := 'PR-' || LPAD(next_number::TEXT, 6, '0');
  RETURN NEW;
END;
$$;

-- Trigger for batch number generation
CREATE TRIGGER generate_production_run_batch_number
BEFORE INSERT ON public.production_runs
FOR EACH ROW
WHEN (NEW.batch_number IS NULL OR NEW.batch_number = '')
EXECUTE FUNCTION public.generate_batch_number();