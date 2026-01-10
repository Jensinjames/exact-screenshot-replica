import { ShoppingCart, DollarSign, Clock, AlertTriangle } from 'lucide-react';
import { StatsCard } from '@/components/ui/stats-card';

interface DashboardStatsProps {
  todayOrdersCount: number;
  todayRevenue: number;
  pendingOrdersCount: number;
  lowStockCount: number;
}

export function DashboardStats({
  todayOrdersCount,
  todayRevenue,
  pendingOrdersCount,
  lowStockCount,
}: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        title="Today's Orders"
        value={todayOrdersCount}
        icon={ShoppingCart}
        description="Orders for pickup today"
        variant="hover"
      />
      <StatsCard
        title="Today's Revenue"
        value={`$${todayRevenue.toFixed(2)}`}
        icon={DollarSign}
        description="From today's orders"
        variant="hover"
      />
      <StatsCard
        title="Pending Orders"
        value={pendingOrdersCount}
        icon={Clock}
        description="Awaiting fulfillment"
        variant="hover"
      />
      <StatsCard
        title="Low Stock Items"
        value={lowStockCount}
        icon={AlertTriangle}
        description="Items need restocking"
        variant={lowStockCount > 0 ? 'destructive' : 'hover'}
        className={lowStockCount > 0 ? 'card-hover' : ''}
      />
    </div>
  );
}
