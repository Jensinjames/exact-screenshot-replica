import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PageLoader } from '@/components/ui/page-loader';
import type { CakeSize, CakeVariety } from '@/types';

interface ProductionSummaryItem {
  size: CakeSize;
  variety: CakeVariety;
  quantity: number;
  doughsNeeded: number;
}

interface ProductionBreakdownProps {
  summary: ProductionSummaryItem[];
  totalCakes: number;
  totalDoughs: number;
  isLoading: boolean;
}

export function ProductionBreakdown({
  summary,
  totalCakes,
  totalDoughs,
  isLoading,
}: ProductionBreakdownProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Production Breakdown</CardTitle>
        <CardDescription>Cakes needed by size and variety</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <PageLoader />
        ) : summary.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-center">Qty</TableHead>
                <TableHead className="text-right">Doughs</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.map((item) => (
                <TableRow key={`${item.size}-${item.variety}`}>
                  <TableCell>
                    <span className="capitalize font-medium">
                      {item.size} {item.variety}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{item.quantity}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{item.doughsNeeded.toFixed(1)}</TableCell>
                </TableRow>
              ))}
              <TableRow className="border-t-2">
                <TableCell className="font-bold">Total</TableCell>
                <TableCell className="text-center font-bold">{totalCakes}</TableCell>
                <TableCell className="text-right font-bold">{totalDoughs.toFixed(1)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No orders for this date</p>
            <Button variant="link" asChild className="mt-2">
              <Link to="/orders/new">Create an order</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
