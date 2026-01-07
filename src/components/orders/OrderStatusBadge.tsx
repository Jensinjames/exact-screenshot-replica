import type { OrderStatus } from '@/types';
import { cn } from '@/lib/utils';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'status-pending' },
  in_production: { label: 'In Production', className: 'status-in-production' },
  ready: { label: 'Ready', className: 'status-ready' },
  fulfilled: { label: 'Fulfilled', className: 'status-fulfilled' },
  cancelled: { label: 'Cancelled', className: 'status-cancelled' },
};

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span className={cn('status-badge', config.className, className)}>
      {config.label}
    </span>
  );
}
