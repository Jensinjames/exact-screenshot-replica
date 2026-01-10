import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import type { Order } from '@/types';

interface RecentOrdersListProps {
  orders: Order[];
}

export function RecentOrdersList({ orders }: RecentOrdersListProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest orders from the past week</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/orders">
            View All
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{order.order_number}</span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {order.customer_name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${Number(order.total_amount).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(order.pickup_date), 'MMM d')}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={ShoppingCart}
            title="No recent orders"
            action={{
              label: "Create your first order",
              href: "/orders/new",
              variant: "link",
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}
