import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toISODateString } from '@/utils/formatters';
import type { Order, Inventory } from '@/types';

interface DashboardStats {
  todayOrdersCount: number;
  todayRevenue: number;
  pendingOrdersCount: number;
  lowStockCount: number;
  lowStockItems: Inventory[];
  recentOrders: Order[];
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard_stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const today = toISODateString(new Date());
      
      // Today's orders
      const { data: todayOrders, error: todayError } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('pickup_date', today);
      
      if (todayError) throw todayError;
      
      // Pending orders
      const { data: pendingOrders, error: pendingError } = await supabase
        .from('orders')
        .select('id')
        .eq('status', 'pending');
      
      if (pendingError) throw pendingError;
      
      // Low stock items
      const { data: lowStockItems, error: lowStockError } = await supabase
        .from('inventory')
        .select('*');
      
      if (lowStockError) throw lowStockError;
      
      const lowStock = lowStockItems?.filter(
        (item) => item.quantity <= item.low_stock_threshold
      ) || [];
      
      // Recent orders (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const { data: recentOrders, error: recentError } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', weekAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (recentError) throw recentError;
      
      const todayRevenue = todayOrders?.reduce(
        (sum, order) => sum + Number(order.total_amount),
        0
      ) || 0;
      
      return {
        todayOrdersCount: todayOrders?.length || 0,
        todayRevenue,
        pendingOrdersCount: pendingOrders?.length || 0,
        lowStockCount: lowStock.length,
        lowStockItems: lowStock as Inventory[],
        recentOrders: (recentOrders || []) as Order[],
      };
    },
  });
}
