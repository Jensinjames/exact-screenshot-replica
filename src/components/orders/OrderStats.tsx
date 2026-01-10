import { ShoppingCart, Clock, DollarSign } from 'lucide-react';
import { StatsCard } from '@/components/ui/stats-card';
import { StatsCardGroup } from '@/components/ui/stats-card-group';

interface Order {
  id: string;
  status: string;
  total_amount: number;
}

interface OrderStatsProps {
  orders: Order[];
}

export function OrderStats({ orders }: OrderStatsProps) {
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount), 0);

  return (
    <StatsCardGroup columns={3}>
      <StatsCard
        title="Total Orders"
        value={totalOrders}
        icon={ShoppingCart}
        valueSize="sm"
      />
      <StatsCard
        title="Pending Orders"
        value={pendingOrders}
        icon={Clock}
        valueSize="sm"
      />
      <StatsCard
        title="Total Revenue"
        value={`$${totalRevenue.toFixed(2)}`}
        icon={DollarSign}
        valueSize="sm"
      />
    </StatsCardGroup>
  );
}
