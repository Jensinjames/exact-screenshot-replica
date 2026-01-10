import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/ui/loading-state';
import { EmptyState } from '@/components/ui/empty-state';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';

interface OrderItem {
  id: string;
  quantity: number;
  size: string;
  variety: string;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_type: string;
  status: 'pending' | 'in_production' | 'ready' | 'fulfilled' | 'cancelled';
  order_items?: OrderItem[];
}

interface DailyOrdersListProps {
  orders: Order[];
  selectedDate: Date;
  isLoading: boolean;
}

export function DailyOrdersList({ orders, selectedDate, isLoading }: DailyOrdersListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders for {format(selectedDate, 'MMM d')}</CardTitle>
        <CardDescription>All orders scheduled for pickup</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingState />
        ) : orders.length > 0 ? (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{order.order_number}</span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {order.customer_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {order.order_items?.length || 0} item(s)
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="capitalize">
                    {order.customer_type}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState title="No orders scheduled" />
        )}
      </CardContent>
    </Card>
  );
}
