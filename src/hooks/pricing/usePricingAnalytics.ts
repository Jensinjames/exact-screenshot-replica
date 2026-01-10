import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { CakeSize, CakeVariety, CustomerType } from '@/types/database';

// Benchmark prices from the PDF
export const BENCHMARK_PRICES = {
  mini: {
    traditional: { retail: 5.99, wholesale: 3.25 },
    praline: { retail: 6.99, wholesale: 3.75 },
    cream_cheese: { retail: 6.99, wholesale: 3.75 },
    apple: { retail: 6.99, wholesale: 3.75 },
    strawberry: { retail: 6.99, wholesale: 3.75 },
    chocolate: { retail: 6.99, wholesale: 3.75 },
    blueberry: { retail: 6.99, wholesale: 3.75 },
  },
  medium: {
    traditional: { retail: 19.99, wholesale: 15.99 },
    praline: { retail: 24.99, wholesale: 18.99 },
    cream_cheese: { retail: 24.99, wholesale: 18.99 },
    apple: { retail: 24.99, wholesale: 18.99 },
    strawberry: { retail: 24.99, wholesale: 18.99 },
    chocolate: { retail: 24.99, wholesale: 18.99 },
    blueberry: { retail: 24.99, wholesale: 18.99 },
  },
} as const;

export interface RevenueByType {
  type: CustomerType;
  revenue: number;
  percentage: number;
  orderCount: number;
}

export interface RevenueByProduct {
  size: CakeSize;
  variety: CakeVariety;
  revenue: number;
  quantity: number;
}

export interface BlendedPrice {
  size: CakeSize;
  variety: CakeVariety;
  retailPrice: number;
  wholesalePrice: number;
  retailQty: number;
  wholesaleQty: number;
  blendedPrice: number;
  totalRevenue: number;
}

export interface OpportunityCost {
  size: CakeSize;
  variety: CakeVariety;
  currentBlended: number;
  benchmarkRetail: number;
  benchmarkWholesale: number;
  potentialRevenue: number;
  actualRevenue: number;
  difference: number;
}

export interface PricingAnalytics {
  revenueByType: RevenueByType[];
  revenueByProduct: RevenueByProduct[];
  blendedPrices: BlendedPrice[];
  opportunityCosts: OpportunityCost[];
  totalRevenue: number;
  totalOrders: number;
  totalQuantity: number;
}

export interface PricingAnalyticsParams {
  startDate?: Date;
  endDate?: Date;
}

export function usePricingAnalytics(params?: PricingAnalyticsParams) {
  const { startDate, endDate } = params || {};

  return useQuery({
    queryKey: ['pricing-analytics', startDate?.toISOString(), endDate?.toISOString()],
    queryFn: async (): Promise<PricingAnalytics> => {
      // Fetch orders with optional date filters
      let ordersQuery = supabase
        .from('orders')
        .select('id, customer_type, status, created_at');

      if (startDate) {
        ordersQuery = ordersQuery.gte('created_at', startDate.toISOString());
      }
      if (endDate) {
        ordersQuery = ordersQuery.lte('created_at', endDate.toISOString());
      }

      const { data: orders, error: ordersError } = await ordersQuery;
      if (ordersError) throw ordersError;

      // Get order IDs within date range
      const orderIds = orders?.map(o => o.id) || [];

      // Fetch order items for filtered orders
      let orderItemsQuery = supabase
        .from('order_items')
        .select(`
          id,
          size,
          variety,
          quantity,
          unit_price,
          total_price,
          order_id
        `);

      // Only filter by order IDs if we have date filters
      if (startDate || endDate) {
        if (orderIds.length === 0) {
          // No orders in range, return empty data
          return {
            revenueByType: [],
            revenueByProduct: [],
            blendedPrices: [],
            opportunityCosts: [],
            totalRevenue: 0,
            totalOrders: 0,
            totalQuantity: 0,
          };
        }
        orderItemsQuery = orderItemsQuery.in('order_id', orderIds);
      }

      const { data: orderItems, error: itemsError } = await orderItemsQuery;
      if (itemsError) throw itemsError;

      // Create order lookup
      const orderLookup = new Map(orders?.map(o => [o.id, o]) || []);

      // Calculate revenue by type
      const revenueByTypeMap = new Map<CustomerType, { revenue: number; orderIds: Set<string> }>();
      
      orderItems?.forEach(item => {
        const order = orderLookup.get(item.order_id);
        if (!order) return;
        
        const existing = revenueByTypeMap.get(order.customer_type) || { revenue: 0, orderIds: new Set() };
        existing.revenue += Number(item.total_price);
        existing.orderIds.add(order.id);
        revenueByTypeMap.set(order.customer_type, existing);
      });

      const totalRevenue = Array.from(revenueByTypeMap.values()).reduce((sum, v) => sum + v.revenue, 0);
      
      const revenueByType: RevenueByType[] = Array.from(revenueByTypeMap.entries()).map(([type, data]) => ({
        type,
        revenue: data.revenue,
        percentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0,
        orderCount: data.orderIds.size,
      }));

      // Calculate revenue by product
      const revenueByProductMap = new Map<string, RevenueByProduct>();
      
      orderItems?.forEach(item => {
        const key = `${item.size}-${item.variety}`;
        const existing = revenueByProductMap.get(key) || {
          size: item.size as CakeSize,
          variety: item.variety as CakeVariety,
          revenue: 0,
          quantity: 0,
        };
        existing.revenue += Number(item.total_price);
        existing.quantity += item.quantity;
        revenueByProductMap.set(key, existing);
      });

      const revenueByProduct = Array.from(revenueByProductMap.values());

      // Calculate blended prices
      const blendedMap = new Map<string, {
        size: CakeSize;
        variety: CakeVariety;
        retailRevenue: number;
        wholesaleRevenue: number;
        retailQty: number;
        wholesaleQty: number;
      }>();

      orderItems?.forEach(item => {
        const order = orderLookup.get(item.order_id);
        if (!order) return;
        
        const key = `${item.size}-${item.variety}`;
        const existing = blendedMap.get(key) || {
          size: item.size as CakeSize,
          variety: item.variety as CakeVariety,
          retailRevenue: 0,
          wholesaleRevenue: 0,
          retailQty: 0,
          wholesaleQty: 0,
        };
        
        if (order.customer_type === 'retail') {
          existing.retailRevenue += Number(item.total_price);
          existing.retailQty += item.quantity;
        } else {
          existing.wholesaleRevenue += Number(item.total_price);
          existing.wholesaleQty += item.quantity;
        }
        blendedMap.set(key, existing);
      });

      const blendedPrices: BlendedPrice[] = Array.from(blendedMap.values()).map(data => {
        const totalQty = data.retailQty + data.wholesaleQty;
        const totalRev = data.retailRevenue + data.wholesaleRevenue;
        return {
          size: data.size,
          variety: data.variety,
          retailPrice: data.retailQty > 0 ? data.retailRevenue / data.retailQty : 0,
          wholesalePrice: data.wholesaleQty > 0 ? data.wholesaleRevenue / data.wholesaleQty : 0,
          retailQty: data.retailQty,
          wholesaleQty: data.wholesaleQty,
          blendedPrice: totalQty > 0 ? totalRev / totalQty : 0,
          totalRevenue: totalRev,
        };
      });

      // Calculate opportunity costs
      const opportunityCosts: OpportunityCost[] = blendedPrices.map(bp => {
        const benchmarks = BENCHMARK_PRICES[bp.size as keyof typeof BENCHMARK_PRICES]?.[bp.variety as keyof typeof BENCHMARK_PRICES['mini']];
        const benchmarkRetail = benchmarks?.retail || 0;
        const benchmarkWholesale = benchmarks?.wholesale || 0;
        
        // Calculate what revenue would be at benchmark prices
        const potentialRevenue = (bp.retailQty * benchmarkRetail) + (bp.wholesaleQty * benchmarkWholesale);
        
        return {
          size: bp.size,
          variety: bp.variety,
          currentBlended: bp.blendedPrice,
          benchmarkRetail,
          benchmarkWholesale,
          potentialRevenue,
          actualRevenue: bp.totalRevenue,
          difference: bp.totalRevenue - potentialRevenue,
        };
      });

      const totalQuantity = orderItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      const totalOrders = new Set(orderItems?.map(item => item.order_id) || []).size;

      return {
        revenueByType,
        revenueByProduct,
        blendedPrices,
        opportunityCosts,
        totalRevenue,
        totalOrders,
        totalQuantity,
      };
    },
  });
}
