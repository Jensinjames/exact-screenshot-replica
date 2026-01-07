import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { OrderWithDetails } from '@/types';

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*),
          customers (*)
        `)
        .eq('id', orderId)
        .single();
      
      if (error) throw error;
      return data as OrderWithDetails;
    },
    enabled: !!orderId,
  });
}
