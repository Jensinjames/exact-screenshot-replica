import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { OrderStatusBadge } from './OrderStatusBadge';
import { PageLoader } from '@/components/ui/page-loader';
import type { OrderStatus } from '@/types';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_type: string;
  pickup_date: string;
  status: string;
  total_amount: number;
}

interface OrderTableProps {
  orders: Order[];
  isLoading: boolean;
}

export function OrderTable({ orders, isLoading }: OrderTableProps) {
  if (isLoading) {
    return <PageLoader message="Loading orders..." />;
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="mb-4">No orders found</p>
        <Button asChild>
          <Link to="/orders/new">Create your first order</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order #</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Pickup Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50">
              <TableCell>
                <Link
                  to={`/orders/${order.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {order.order_number}
                </Link>
              </TableCell>
              <TableCell>{order.customer_name}</TableCell>
              <TableCell className="capitalize">{order.customer_type}</TableCell>
              <TableCell>{format(new Date(order.pickup_date), 'MMM d, yyyy')}</TableCell>
              <TableCell>
                <OrderStatusBadge status={order.status as OrderStatus} />
              </TableCell>
              <TableCell className="text-right font-medium">
                ${Number(order.total_amount).toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
