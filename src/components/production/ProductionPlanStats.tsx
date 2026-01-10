import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProductionPlanStatsProps {
  totalCakes: number;
  totalDoughs: number;
  orderCount: number;
  selectedDate: Date;
}

export function ProductionPlanStats({
  totalCakes,
  totalDoughs,
  orderCount,
  selectedDate,
}: ProductionPlanStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card className="gradient-primary text-primary-foreground">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium opacity-90">Total Cakes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{totalCakes}</div>
          <p className="text-sm opacity-80 mt-1">for {format(selectedDate, 'MMM d')}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Doughs Needed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{totalDoughs.toFixed(1)}</div>
          <p className="text-sm text-muted-foreground mt-1">batches of dough</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{orderCount}</div>
          <p className="text-sm text-muted-foreground mt-1">to fulfill</p>
        </CardContent>
      </Card>
    </div>
  );
}
