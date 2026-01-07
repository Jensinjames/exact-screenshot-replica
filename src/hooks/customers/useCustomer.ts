import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { CustomerWithOrders } from '@/types';

export function useCustomer(customerId: string) {
  return useQuery({
    queryKey: ['customer', customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          orders (
            *,
            order_items (*)
          )
        `)
        .eq('id', customerId)
        .single();
      
      if (error) throw error;
      return data as CustomerWithOrders;
    },
    enabled: !!customerId,
  });
}
