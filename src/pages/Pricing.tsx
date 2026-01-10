import { useState } from 'react';
import { DollarSign, TrendingUp, ShoppingCart, Package } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatsCard } from '@/components/ui/stats-card';
import { PageHeader } from '@/components/ui/page-header';
import { usePricingAnalytics } from '@/hooks/pricing';
import { RevenueByTypeChart } from '@/components/pricing/RevenueByTypeChart';
import { RevenueByProductChart } from '@/components/pricing/RevenueByProductChart';
import { BlendedPriceTable } from '@/components/pricing/BlendedPriceTable';
import { OpportunityCostCard } from '@/components/pricing/OpportunityCostCard';
import { DateRangeFilter } from '@/components/pricing/DateRangeFilter';
import { AIPricingInsightsCard } from '@/components/pricing/AIPricingInsightsCard';
import { PricingSimulator } from '@/components/pricing/PricingSimulator';
import { formatCurrency } from '@/utils/formatters';

export default function Pricing() {
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const { data, isLoading, error } = usePricingAnalytics({ startDate, endDate });

  const handleDateChange = (start: Date | undefined, end: Date | undefined) => {
    setStartDate(start);
    setEndDate(end);
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-destructive">
          Failed to load pricing analytics. Please try again.
        </div>
      </div>
    );
  }

  const avgOrderValue =
    data && data.totalOrders > 0
      ? formatCurrency(data.totalRevenue / data.totalOrders)
      : '$0.00';

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Pricing Analytics"
        description="Revenue breakdown, blended metrics, and opportunity cost analysis"
        actions={
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onDateChange={handleDateChange}
          />
        }
      />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(data?.totalRevenue || 0)}
          icon={DollarSign}
          valueSize="sm"
          isLoading={isLoading}
        />
        <StatsCard
          title="Total Orders"
          value={data?.totalOrders || 0}
          icon={ShoppingCart}
          valueSize="sm"
          isLoading={isLoading}
        />
        <StatsCard
          title="Units Sold"
          value={data?.totalQuantity || 0}
          icon={Package}
          valueSize="sm"
          isLoading={isLoading}
        />
        <StatsCard
          title="Avg Order Value"
          value={avgOrderValue}
          icon={TrendingUp}
          valueSize="sm"
          isLoading={isLoading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {isLoading ? (
          <>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <RevenueByTypeChart data={data?.revenueByType || []} />
            <RevenueByProductChart data={data?.revenueByProduct || []} />
          </>
        )}
      </div>

      {/* Blended Price Table */}
      {isLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[200px] w-full" />
          </CardContent>
        </Card>
      ) : (
        <BlendedPriceTable data={data?.blendedPrices || []} />
      )}

      {/* Opportunity Cost Analysis */}
      {isLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      ) : (
        <OpportunityCostCard data={data?.opportunityCosts || []} />
      )}

      {/* Pricing Simulator */}
      <PricingSimulator
        blendedPrices={data?.blendedPrices || []}
        isLoading={isLoading}
      />

      {/* AI Pricing Insights */}
      <AIPricingInsightsCard
        analyticsData={data}
        isLoading={isLoading}
        dateRangeStart={startDate}
        dateRangeEnd={endDate}
      />
    </div>
  );
}
