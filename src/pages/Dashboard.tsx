import { useDashboardStats } from '@/hooks/dashboard';
import { PageLoader } from '@/components/ui/page-loader';
import {
  DashboardHeader,
  DashboardStats,
  RecentOrdersList,
  InventoryAlerts,
} from '@/components/dashboard';

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return <PageLoader message="Loading dashboard..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <DashboardHeader currentDate={new Date()} />

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
