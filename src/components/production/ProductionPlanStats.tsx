import { format } from 'date-fns';
import { StatsCard } from '@/components/ui/stats-card';

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
      <StatsCard
        title="Total Cakes"
        value={totalCakes}
        description={`for ${format(selectedDate, 'MMM d')}`}
        variant="primary"
        valueSize="lg"
      />
      <StatsCard
        title="Doughs Needed"
        value={totalDoughs.toFixed(1)}
        description="batches of dough"
        valueSize="lg"
      />
      <StatsCard
        title="Orders"
        value={orderCount}
        description="to fulfill"
        valueSize="lg"
      />
    </div>
  );
}
