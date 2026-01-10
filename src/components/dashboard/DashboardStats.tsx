import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, DollarSign, Clock, AlertTriangle } from 'lucide-react';

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
      <Card className="card-hover">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Today's Orders
          </CardTitle>
          <ShoppingCart className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{todayOrdersCount}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Orders for pickup today
          </p>
        </CardContent>
      </Card>

      <Card className="card-hover">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Today's Revenue
          </CardTitle>
          <DollarSign className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            ${todayRevenue.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            From today's orders
          </p>
        </CardContent>
      </Card>

      <Card className="card-hover">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Pending Orders
          </CardTitle>
          <Clock className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{pendingOrdersCount}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Awaiting fulfillment
          </p>
        </CardContent>
      </Card>

      <Card className={`card-hover ${lowStockCount > 0 ? 'border-destructive/50' : ''}`}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Low Stock Items
          </CardTitle>
          <AlertTriangle className={`w-4 h-4 ${lowStockCount > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{lowStockCount}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Items need restocking
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
