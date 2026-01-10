import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrders } from '@/hooks/orders';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { OrderFilters, OrderTable, OrderStats } from '@/components/orders';

export default function Orders() {
  const { data: orders, isLoading } = useOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredOrders = orders?.filter((order) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Orders</h1>
          <p className="text-muted-foreground">Manage all customer orders</p>
        </div>
        <Button asChild>
          <Link to="/orders/new">
            <Plus className="w-4 h-4 mr-2" />
            New Order
          </Link>
        </Button>
      </div>

      <OrderStats orders={orders || []} />

      <Card>
        <CardHeader>
          <OrderFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
          />
        </CardHeader>
        <CardContent>
          <OrderTable orders={filteredOrders || []} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
