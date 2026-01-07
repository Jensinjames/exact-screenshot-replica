import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AddInventoryItemParams {
  name: string;
  quantity: number;
  unit: string;
  lowStockThreshold: number;
  costPerUnit?: number;
}

export function useAddInventoryItem(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      quantity,
      unit,
      lowStockThreshold,
      costPerUnit,
    }: AddInventoryItemParams) => {
      if (!name.trim()) throw new Error('Please enter an item name');
      if (!unit.trim()) throw new Error('Please enter a unit');

      const { data, error } = await supabase.from('inventory').insert({
        name: name.trim(),
        quantity,
        unit: unit.trim(),
        low_stock_threshold: lowStockThreshold,
        cost_per_unit: costPerUnit ?? null,
      }).select().single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
      toast.success('Item added to inventory');
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useAdjustInventoryQuantity(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, newQuantity }: { itemId: string; newQuantity: number }) => {
      const { error } = await supabase
        .from('inventory')
        .update({ quantity: newQuantity })
        .eq('id', itemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
      toast.success('Quantity updated');
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
