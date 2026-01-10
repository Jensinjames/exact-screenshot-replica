import { User, Building2 } from 'lucide-react';
import { StatsCard } from '@/components/ui/stats-card';
import { StatsCardGroup } from '@/components/ui/stats-card-group';

interface CustomerStatsProps {
  total: number;
  retailCount: number;
  wholesaleCount: number;
}

export function CustomerStats({ total, retailCount, wholesaleCount }: CustomerStatsProps) {
  return (
    <StatsCardGroup columns={3}>
      <StatsCard
        title="Total Customers"
        value={total}
      />
      <StatsCard
        title="Retail"
        value={retailCount}
        icon={User}
      />
      <StatsCard
        title="Wholesale"
        value={wholesaleCount}
        icon={Building2}
      />
    </StatsCardGroup>
  );
}
