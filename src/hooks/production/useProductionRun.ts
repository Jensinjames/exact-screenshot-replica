import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ProductionRunWithOutputs } from './useProductionRuns';

export function useProductionRun(id: string | undefined) {
  return useQuery({
    queryKey: ['production-run', id],
    queryFn: async (): Promise<ProductionRunWithOutputs | null> => {
      if (!id) return null;

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
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as ProductionRunWithOutputs;
    },
    enabled: !!id,
  });
}
