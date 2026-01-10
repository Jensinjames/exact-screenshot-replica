import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Clock, DollarSign } from 'lucide-react';

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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalOrders}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingOrders}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
        </CardContent>
      </Card>
    </div>
  );
}
