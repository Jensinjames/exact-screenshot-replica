import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { SimulatorProductResult } from '@/hooks/pricing/usePricingSimulator';
import { formatCurrency } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface SimulatorBreakdownProps {
  productResults: SimulatorProductResult[];
}

const formatProductName = (size: string, variety: string) => {
  const sizeLabel = size.charAt(0).toUpperCase() + size.slice(1);
  const varietyLabel = variety
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  return `${sizeLabel} ${varietyLabel}`;
};

export function SimulatorBreakdown({ productResults }: SimulatorBreakdownProps) {
  // Filter out products with no sales
  const productsWithSales = productResults.filter(
    p => p.retailQty > 0 || p.wholesaleQty > 0
  );

  if (productsWithSales.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No sales data available for breakdown.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead className="text-right">Retail Qty</TableHead>
          <TableHead className="text-right">Wholesale Qty</TableHead>
          <TableHead className="text-right">Current Revenue</TableHead>
          <TableHead className="text-right">Projected Revenue</TableHead>
          <TableHead className="text-right">Difference</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {productsWithSales.map((result) => {
          const isPositive = result.difference > 0;
          const isNegative = result.difference < 0;

          return (
            <TableRow key={`${result.size}-${result.variety}`}>
              <TableCell className="font-medium">
                {formatProductName(result.size, result.variety)}
              </TableCell>
              <TableCell className="text-right">{result.retailQty}</TableCell>
              <TableCell className="text-right">{result.wholesaleQty}</TableCell>
              <TableCell className="text-right">
                {formatCurrency(result.currentRevenue)}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(result.projectedRevenue)}
              </TableCell>
              <TableCell className={cn(
                "text-right font-medium",
                isPositive && "text-green-600 dark:text-green-400",
                isNegative && "text-red-600 dark:text-red-400"
              )}>
                {isPositive && '+'}
                {formatCurrency(result.difference)}
                <span className="text-xs ml-1">
                  ({isPositive && '+'}
                  {result.percentChange.toFixed(1)}%)
                </span>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
