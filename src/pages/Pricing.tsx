import { useState } from 'react';
import { DollarSign, TrendingUp, ShoppingCart, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
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

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pricing Analytics</h1>
          <p className="text-muted-foreground">
            Revenue breakdown, blended metrics, and opportunity cost analysis
          </p>
        </div>
        <DateRangeFilter
          startDate={startDate}
          endDate={endDate}
          onDateChange={handleDateChange}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                {formatCurrency(data?.totalRevenue || 0)}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{data?.totalOrders || 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Units Sold</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{data?.totalQuantity || 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                {data && data.totalOrders > 0
                  ? formatCurrency(data.totalRevenue / data.totalOrders)
                  : '$0.00'}
              </div>
            )}
          </CardContent>
        </Card>
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
