import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Plus, Calendar } from 'lucide-react';
import { useDashboardStats } from '@/hooks/dashboard';
import { LoadingState } from '@/components/ui/loading-state';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import {
  DashboardStats,
  RecentOrdersList,
  InventoryAlerts,
} from '@/components/dashboard';

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return <LoadingState size="full" message="Loading dashboard..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Dashboard"
        description={format(new Date(), 'EEEE, MMMM d, yyyy')}
        actions={
          <>
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
          </>
        }
      />

      <DashboardStats
        todayOrdersCount={stats?.todayOrdersCount || 0}
        todayRevenue={stats?.todayRevenue || 0}
        pendingOrdersCount={stats?.pendingOrdersCount || 0}
        lowStockCount={stats?.lowStockCount || 0}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrdersList orders={stats?.recentOrders || []} />
        <InventoryAlerts items={stats?.lowStockItems || []} />
      </div>
    </div>
  );
}
