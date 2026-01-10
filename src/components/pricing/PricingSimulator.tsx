import { useEffect } from 'react';
import { Calculator, RotateCcw, Percent } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { usePricingSimulator } from '@/hooks/pricing/usePricingSimulator';
import { ProductPriceEditor } from './ProductPriceEditor';
import { SimulatorSummary } from './SimulatorSummary';
import { SimulatorBreakdown } from './SimulatorBreakdown';
import type { BlendedPrice } from '@/hooks/pricing';

interface PricingSimulatorProps {
  blendedPrices: BlendedPrice[];
  isLoading?: boolean;
}

export function PricingSimulator({ blendedPrices, isLoading }: PricingSimulatorProps) {
  const {
    simulatedPrices,
    results,
    hasChanges,
    initializePrices,
    updatePrice,
    applyPercentageAdjustment,
    resetPrices,
  } = usePricingSimulator({ blendedPrices });

  // Initialize prices when blendedPrices changes
  useEffect(() => {
    if (blendedPrices.length > 0) {
      initializePrices();
    }
  }, [blendedPrices, initializePrices]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (blendedPrices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Pricing Simulator
          </CardTitle>
          <CardDescription>
            Test different price points and see projected revenue impact
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-12">
            No sales data available for simulation. Generate some orders first!
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Pricing Simulator
            </CardTitle>
            <CardDescription>
              Test different price points and see projected revenue impact based on historical sales
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetPrices}
              disabled={!hasChanges}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyPercentageAdjustment(5, 'all')}
            >
              <Percent className="h-4 w-4 mr-1" />
              +5% All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyPercentageAdjustment(10, 'all')}
            >
              <Percent className="h-4 w-4 mr-1" />
              +10% All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyPercentageAdjustment(-5, 'all')}
            >
              <Percent className="h-4 w-4 mr-1" />
              -5% All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Revenue Impact Summary */}
        <SimulatorSummary results={results} />

        {/* Price Editors */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-3">Adjust Prices</h4>
          <div className="max-h-[300px] overflow-y-auto">
            {simulatedPrices.map((price) => (
              <ProductPriceEditor
                key={`${price.size}-${price.variety}`}
                price={price}
                onUpdate={updatePrice}
              />
            ))}
          </div>
        </div>

        {/* Product Breakdown Table */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-3">Revenue Breakdown by Product</h4>
          <SimulatorBreakdown productResults={results.productResults} />
        </div>
      </CardContent>
    </Card>
  );
}
