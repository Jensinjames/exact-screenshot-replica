import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProductionRun {
  id: string;
  run_date: string;
  batch_number: string;
  doughs_produced: number;
  notes: string | null;
  labor_cost: number | null;
  ingredient_cost: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductionRunWithOutputs extends ProductionRun {
  production_run_outputs: {
    id: string;
    size: string;
    variety: string;
    quantity_produced: number;
    quantity_sold: number;
  }[];
}

export function useProductionRuns() {
  return useQuery({
    queryKey: ['production-runs'],
    queryFn: async (): Promise<ProductionRunWithOutputs[]> => {
      const { data, error } = await supabase
        .from('production_runs')
        .select(`
          *,
          production_run_outputs (
            id,
            size,
            variety,
            quantity_produced,
            quantity_sold
          )
        `)
        .order('run_date', { ascending: false });

      if (error) throw error;
      return data as ProductionRunWithOutputs[];
    },
  });
}
