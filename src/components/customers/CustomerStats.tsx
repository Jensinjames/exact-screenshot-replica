import { User, Building2 } from 'lucide-react';
import { StatsCard } from '@/components/ui/stats-card';

interface CustomerStatsProps {
  total: number;
  retailCount: number;
  wholesaleCount: number;
}

export function CustomerStats({ total, retailCount, wholesaleCount }: CustomerStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
    </div>
  );
}
