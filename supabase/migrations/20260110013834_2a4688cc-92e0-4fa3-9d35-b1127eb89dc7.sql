-- Create pricing_insights_history table
CREATE TABLE public.pricing_insights_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  date_range_start date,
  date_range_end date,
  analytics_summary jsonb NOT NULL,
  insights jsonb NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.pricing_insights_history ENABLE ROW LEVEL SECURITY;

-- Create policy for team access
CREATE POLICY "Team members can manage pricing insights history"
ON public.pricing_insights_history
FOR ALL
USING (has_team_access())
WITH CHECK (has_team_access());