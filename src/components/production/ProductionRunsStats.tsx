import { Factory, DollarSign, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingState } from '@/components/ui/loading-state';
import { formatCurrency } from '@/utils/formatters';

interface ProductionRunsStatsProps {
  totalRuns: number;
  totalDoughs: number;
  totalCakes: number;
  totalCosts: number;
  isLoading: boolean;
}

export function ProductionRunsStats({
  totalRuns,
  totalDoughs,
  totalCakes,
  totalCosts,
  isLoading,
}: ProductionRunsStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Runs</CardTitle>
          <Factory className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingState variant="skeleton" skeletonType="stat" />
          ) : (
            <div className="text-2xl font-bold">{totalRuns}</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Doughs Produced</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingState variant="skeleton" skeletonType="stat" />
          ) : (
            <div className="text-2xl font-bold">{totalDoughs}</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cakes Produced</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingState variant="skeleton" skeletonType="stat" />
          ) : (
            <div className="text-2xl font-bold">{totalCakes}</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Costs</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingState variant="skeleton" skeletonType="stat" className="w-24" />
          ) : (
            <div className="text-2xl font-bold">{formatCurrency(totalCosts)}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
