import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Factory, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PageLoader } from '@/components/ui/page-loader';
import { formatCurrency } from '@/utils/formatters';

interface ProductionRunOutput {
  quantity_produced: number;
}

interface ProductionRun {
  id: string;
  batch_number: string;
  run_date: string;
  doughs_produced: number;
  labor_cost: number | null;
  ingredient_cost: number | null;
  production_run_outputs: ProductionRunOutput[];
}

interface ProductionRunsTableProps {
  runs: ProductionRun[];
  isLoading: boolean;
}

export function ProductionRunsTable({ runs, isLoading }: ProductionRunsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Production Run History</CardTitle>
        <CardDescription>All production runs with their outputs and costs</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <PageLoader />
        ) : runs.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Doughs</TableHead>
                <TableHead className="text-right">Cakes</TableHead>
                <TableHead className="text-right">Labor Cost</TableHead>
                <TableHead className="text-right">Ingredient Cost</TableHead>
                <TableHead className="text-right">Total Cost</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {runs.map((run) => {
                const cakesProduced = run.production_run_outputs.reduce(
                  (sum, o) => sum + o.quantity_produced,
                  0
                );
                const totalCost =
                  Number(run.labor_cost || 0) + Number(run.ingredient_cost || 0);

                return (
                  <TableRow key={run.id}>
                    <TableCell className="font-medium">{run.batch_number}</TableCell>
                    <TableCell>{format(new Date(run.run_date), 'MMM d, yyyy')}</TableCell>
                    <TableCell className="text-right">{run.doughs_produced}</TableCell>
                    <TableCell className="text-right">{cakesProduced}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(Number(run.labor_cost || 0))}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(Number(run.ingredient_cost || 0))}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(totalCost)}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/production-runs/${run.id}`}>
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Factory className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No production runs yet</p>
            <p className="text-sm">Click "New Run" to record your first production batch</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
