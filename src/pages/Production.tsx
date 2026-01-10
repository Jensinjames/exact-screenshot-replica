import { useState, useMemo } from 'react';
import { useProductionPlan } from '@/hooks/production';
import { useProducts } from '@/hooks/products';
import type { CakeSize, CakeVariety } from '@/types';
import {
  DateNavigation,
  ProductionPlanStats,
  ProductionBreakdown,
  DailyOrdersList,
  IngredientEstimates,
} from '@/components/production';

interface ProductionSummary {
  size: CakeSize;
  variety: CakeVariety;
  quantity: number;
  doughsNeeded: number;
}

export default function Production() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { data, isLoading } = useProductionPlan(selectedDate);
  const { data: products } = useProducts();

  // Calculate production summary from orders
  const productionSummary = useMemo(() => {
    if (!data?.orders || !products) return [];

    const summary: Record<string, ProductionSummary> = {};

    data.orders.forEach((order: any) => {
      order.order_items?.forEach((item: any) => {
        const key = `${item.size}-${item.variety}`;
        const product = products.find(
          (p) => p.size === item.size && p.variety === item.variety
        );

        if (!summary[key]) {
          summary[key] = {
            size: item.size,
            variety: item.variety,
            quantity: 0,
            doughsNeeded: 0,
          };
        }

        summary[key].quantity += item.quantity;
        summary[key].doughsNeeded += item.quantity * (product?.doughs_required || 1);
      });
    });

    return Object.values(summary).sort((a, b) => {
      const sizeOrder = { mini: 0, medium: 1, large: 2, super: 3 };
      return sizeOrder[a.size] - sizeOrder[b.size];
    });
  }, [data?.orders, products]);

  const totalDoughs = productionSummary.reduce((sum, item) => sum + item.doughsNeeded, 0);
  const totalCakes = productionSummary.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Date Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Production Plan</h1>
          <p className="text-muted-foreground">
            Daily production planning based on orders
          </p>
        </div>

        <DateNavigation
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />
      </div>

      <ProductionPlanStats
        totalCakes={totalCakes}
        totalDoughs={totalDoughs}
        orderCount={data?.orders?.length || 0}
        selectedDate={selectedDate}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProductionBreakdown
          summary={productionSummary}
          totalCakes={totalCakes}
          totalDoughs={totalDoughs}
          isLoading={isLoading}
        />
        <DailyOrdersList
          orders={data?.orders || []}
          selectedDate={selectedDate}
          isLoading={isLoading}
        />
      </div>

      <IngredientEstimates totalDoughs={totalDoughs} />
    </div>
  );
}
