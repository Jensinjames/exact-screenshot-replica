import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { CakeSize, CakeVariety } from '@/types/database';

export interface ProductionOutput {
  size: CakeSize;
  variety: CakeVariety;
  quantity_produced: number;
}

export interface CreateProductionRunInput {
  run_date: string;
  doughs_produced: number;
  notes?: string;
  labor_cost?: number;
  ingredient_cost?: number;
  outputs: ProductionOutput[];
}

export function useCreateProductionRun() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateProductionRunInput) => {
      // Create production run
      const { data: run, error: runError } = await supabase
        .from('production_runs')
        .insert({
          run_date: input.run_date,
          batch_number: '', // Will be auto-generated
          doughs_produced: input.doughs_produced,
          notes: input.notes || null,
          labor_cost: input.labor_cost || 0,
          ingredient_cost: input.ingredient_cost || 0,
          created_by: user?.id || null,
        })
        .select()
        .single();

      if (runError) throw runError;

      // Create outputs if any
      if (input.outputs.length > 0) {
        const outputs = input.outputs.map(o => ({
          run_id: run.id,
          size: o.size,
          variety: o.variety,
          quantity_produced: o.quantity_produced,
          quantity_sold: 0,
        }));

        const { error: outputsError } = await supabase
          .from('production_run_outputs')
          .insert(outputs);

        if (outputsError) throw outputsError;
      }

      return run;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production-runs'] });
    },
  });
}
