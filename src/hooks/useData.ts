import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type Product = Database['public']['Tables']['products']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];
export type Customer = Database['public']['Tables']['customers']['Row'];
export type Inventory = Database['public']['Tables']['inventory']['Row'];
export type ProductionPlan = Database['public']['Tables']['production_plans']['Row'];

export type OrderStatus = Database['public']['Enums']['order_status'];
export type CustomerType = Database['public']['Enums']['customer_type'];
export type CakeSize = Database['public']['Enums']['cake_size'];
export type CakeVariety = Database['public']['Enums']['cake_variety'];

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('size', { ascending: true });
      
      if (error) throw error;
      return data as Product[];
    },
  });
}

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
        query = query.gte('pickup_date', startDate.toISOString().split('T')[0]);
      }
      if (endDate) {
        query = query.lte('pickup_date', endDate.toISOString().split('T')[0]);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

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
      return data;
    },
    enabled: !!orderId,
  });
}

export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data as Customer[];
    },
  });
}

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
      return data;
    },
    enabled: !!customerId,
  });
}

export function useInventory() {
  return useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data as Inventory[];
    },
  });
}

export function useProductionPlan(date: Date) {
  return useQuery({
    queryKey: ['production_plan', date.toISOString().split('T')[0]],
    queryFn: async () => {
      const dateStr = date.toISOString().split('T')[0];
      
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
      
      return { orders, plan };
    },
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard_stats'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
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
        lowStockItems: lowStock,
        recentOrders: recentOrders || [],
      };
    },
  });
}
