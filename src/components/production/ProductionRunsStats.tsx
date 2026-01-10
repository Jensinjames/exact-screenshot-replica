import { Factory, DollarSign, Package } from 'lucide-react';
import { StatsCard } from '@/components/ui/stats-card';
import { StatsCardGroup } from '@/components/ui/stats-card-group';
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
    <StatsCardGroup columns={4}>
      <StatsCard
        title="Total Runs"
        value={totalRuns}
        icon={Factory}
        valueSize="sm"
        isLoading={isLoading}
      />
      <StatsCard
        title="Doughs Produced"
        value={totalDoughs}
        icon={Package}
        valueSize="sm"
        isLoading={isLoading}
      />
      <StatsCard
        title="Cakes Produced"
        value={totalCakes}
        icon={Package}
        valueSize="sm"
        isLoading={isLoading}
      />
      <StatsCard
        title="Total Costs"
        value={formatCurrency(totalCosts)}
        icon={DollarSign}
        valueSize="sm"
        isLoading={isLoading}
      />
    </StatsCardGroup>
  );
}
