import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { OpportunityCost } from '@/hooks/pricing';
import { formatCurrency } from '@/utils/formatters';

interface OpportunityCostCardProps {
  data: OpportunityCost[];
}

export function OpportunityCostCard({ data }: OpportunityCostCardProps) {
  const totalActual = data.reduce((sum, item) => sum + item.actualRevenue, 0);
  const totalPotential = data.reduce((sum, item) => sum + item.potentialRevenue, 0);
  const totalDifference = totalActual - totalPotential;

  // Filter items with meaningful data
  const meaningfulData = data.filter(item => item.actualRevenue > 0 && item.benchmarkRetail > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Opportunity Cost Analysis</CardTitle>
        <CardDescription>
          Comparing actual revenue to benchmark pricing from the pricing snapshot
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 rounded-lg bg-muted">
            <p className="text-sm text-muted-foreground">Actual Revenue</p>
            <p className="text-2xl font-bold">{formatCurrency(totalActual)}</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted">
            <p className="text-sm text-muted-foreground">At Benchmark Prices</p>
            <p className="text-2xl font-bold">{formatCurrency(totalPotential)}</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted">
            <p className="text-sm text-muted-foreground">Difference</p>
            <p className={`text-2xl font-bold ${totalDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalDifference >= 0 ? '+' : ''}{formatCurrency(totalDifference)}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            By Product
          </h4>
          {meaningfulData.map((item) => {
            const productName = `${item.size.charAt(0).toUpperCase() + item.size.slice(1)} ${
              item.variety.charAt(0).toUpperCase() + item.variety.slice(1).replace('_', ' ')
            }`;
            
            const percentDiff = item.potentialRevenue > 0 
              ? ((item.difference / item.potentialRevenue) * 100)
              : 0;

            return (
              <div 
                key={`${item.size}-${item.variety}`}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  {item.difference > 0 ? (
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  ) : item.difference < 0 ? (
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  ) : (
                    <Minus className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium">{productName}</p>
                    <p className="text-sm text-muted-foreground">
                      Benchmark: {formatCurrency(item.benchmarkRetail)} retail / {formatCurrency(item.benchmarkWholesale)} wholesale
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge 
                    variant={item.difference >= 0 ? 'default' : 'destructive'}
                    className="mb-1"
                  >
                    {item.difference >= 0 ? '+' : ''}{formatCurrency(item.difference)}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    {percentDiff >= 0 ? '+' : ''}{percentDiff.toFixed(1)}%
                  </p>
                </div>
              </div>
            );
          })}
          
          {meaningfulData.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              No order data available for comparison
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
