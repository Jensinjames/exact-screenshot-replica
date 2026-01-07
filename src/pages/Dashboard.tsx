import { Link } from 'react-router-dom';
import { useDashboardStats } from '@/hooks/dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  DollarSign, 
  Clock, 
  AlertTriangle,
  Plus,
  ArrowRight,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild>
            <Link to="/orders/new">
              <Plus className="w-4 h-4 mr-2" />
              New Order
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/production">
              <Calendar className="w-4 h-4 mr-2" />
              Today's Plan
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today's Orders
            </CardTitle>
            <ShoppingCart className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.todayOrdersCount || 0}</div>
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
              ${stats?.todayRevenue?.toFixed(2) || '0.00'}
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
            <div className="text-3xl font-bold">{stats?.pendingOrdersCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting fulfillment
            </p>
          </CardContent>
        </Card>

        <Card className={`card-hover ${stats?.lowStockCount ? 'border-destructive/50' : ''}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Low Stock Items
            </CardTitle>
            <AlertTriangle className={`w-4 h-4 ${stats?.lowStockCount ? 'text-destructive' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.lowStockCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Items need restocking
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
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
            {stats?.recentOrders && stats.recentOrders.length > 0 ? (
              <div className="space-y-4">
                {stats.recentOrders.map((order) => (
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
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No recent orders</p>
                <Button variant="link" asChild className="mt-2">
                  <Link to="/orders/new">Create your first order</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Inventory Alerts</CardTitle>
              <CardDescription>Items running low on stock</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/inventory">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {stats?.lowStockItems && stats.lowStockItems.length > 0 ? (
              <div className="space-y-3">
                {stats.lowStockItems.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-destructive/30 bg-destructive/5"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Threshold: {item.low_stock_threshold} {item.unit}
                      </p>
                    </div>
                    <Badge variant="destructive">
                      {item.quantity} {item.unit}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>All inventory levels are good!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
