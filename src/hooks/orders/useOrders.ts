import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toISODateString } from '@/utils/formatters';
import type { OrderWithItems } from '@/types';

export function useOrders(startDate?: Date, endDate?: Date) {
  return useQuery({
    queryKey: ['orders', startDate?.toISOString(), endDate?.toISOString()],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('pickup_date', { ascending: true });
      
      if (startDate) {
        query = query.gte('pickup_date', toISODateString(startDate));
      }
      if (endDate) {
        query = query.lte('pickup_date', toISODateString(endDate));
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as OrderWithItems[];
    },
  });
}
