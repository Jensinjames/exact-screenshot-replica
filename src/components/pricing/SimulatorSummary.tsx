import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { SimulatorResult } from '@/hooks/pricing/usePricingSimulator';
import { formatCurrency } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface SimulatorSummaryProps {
  results: SimulatorResult;
}

export function SimulatorSummary({ results }: SimulatorSummaryProps) {
  const { currentTotalRevenue, projectedTotalRevenue, totalDifference, totalPercentChange } = results;

  const isPositive = totalDifference > 0;
  const isNegative = totalDifference < 0;
  const isNeutral = totalDifference === 0;

  return (
    <Card className="bg-muted/50">
      <CardContent className="pt-6">
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Current Revenue</p>
            <p className="text-2xl font-bold">{formatCurrency(currentTotalRevenue)}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground mb-1">Projected Revenue</p>
            <p className={cn(
              "text-2xl font-bold",
              isPositive && "text-green-600 dark:text-green-400",
              isNegative && "text-red-600 dark:text-red-400"
            )}>
              {formatCurrency(projectedTotalRevenue)}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground mb-1">Difference</p>
            <div className={cn(
              "flex items-center justify-center gap-1",
              isPositive && "text-green-600 dark:text-green-400",
              isNegative && "text-red-600 dark:text-red-400",
              isNeutral && "text-muted-foreground"
            )}>
              {isPositive && <TrendingUp className="h-5 w-5" />}
              {isNegative && <TrendingDown className="h-5 w-5" />}
              {isNeutral && <Minus className="h-5 w-5" />}
              <span className="text-2xl font-bold">
                {isPositive && '+'}
                {formatCurrency(totalDifference)}
              </span>
            </div>
            <p className={cn(
              "text-sm",
              isPositive && "text-green-600 dark:text-green-400",
              isNegative && "text-red-600 dark:text-red-400",
              isNeutral && "text-muted-foreground"
            )}>
              {isPositive && '+'}
              {totalPercentChange.toFixed(1)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
