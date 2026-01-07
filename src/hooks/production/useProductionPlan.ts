import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toISODateString } from '@/utils/formatters';
import type { OrderWithItems, ProductionPlan } from '@/types';

interface ProductionPlanData {
  orders: OrderWithItems[];
  plan: ProductionPlan | null;
}

export function useProductionPlan(date: Date) {
  return useQuery({
    queryKey: ['production_plan', toISODateString(date)],
    queryFn: async (): Promise<ProductionPlanData> => {
      const dateStr = toISODateString(date);
      
      // Get orders for this date
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('pickup_date', dateStr)
        .in('status', ['pending', 'in_production']);
      
      if (ordersError) throw ordersError;
      
      // Get existing production plan
      const { data: plan, error: planError } = await supabase
        .from('production_plans')
        .select('*')
        .eq('plan_date', dateStr)
        .maybeSingle();
      
      if (planError) throw planError;
      
      return { orders: orders as OrderWithItems[], plan };
    },
  });
}
