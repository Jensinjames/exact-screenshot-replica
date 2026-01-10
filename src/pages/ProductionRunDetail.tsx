import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, DollarSign, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useProductionRun } from '@/hooks/production/useProductionRun';
import { RunOutputTable } from '@/components/production/RunOutputTable';
import { formatCurrency } from '@/utils/formatters';

export default function ProductionRunDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: run, isLoading, error } = useProductionRun(id);

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-destructive">
          Failed to load production run. Please try again.
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[200px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!run) {
    return (
      <div className="p-6">
        <div className="text-center text-muted-foreground">
          Production run not found.
        </div>
      </div>
    );
  }

  const totalCakes = run.production_run_outputs.reduce(
    (sum, o) => sum + o.quantity_produced, 0
  );
  const totalCost = Number(run.labor_cost || 0) + Number(run.ingredient_cost || 0);
  const costPerDough = run.doughs_produced > 0 ? totalCost / run.doughs_produced : 0;
  const costPerCake = totalCakes > 0 ? totalCost / totalCakes : 0;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/production-runs">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{run.batch_number}</h1>
          <p className="text-muted-foreground">
            Production run from {format(new Date(run.run_date), 'MMMM d, yyyy')}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Run Date</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {format(new Date(run.run_date), 'MMM d')}
            </div>
            <p className="text-xs text-muted-foreground">
              {format(new Date(run.run_date), 'yyyy')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doughs Produced</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{run.doughs_produced}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cakes Produced</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCakes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCost)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Cost Breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cost Breakdown</CardTitle>
            <CardDescription>Labor and ingredient costs for this run</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Labor Cost</span>
              <span className="font-semibold">{formatCurrency(Number(run.labor_cost || 0))}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Ingredient Cost</span>
              <span className="font-semibold">{formatCurrency(Number(run.ingredient_cost || 0))}</span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Cost</span>
                <span className="font-bold text-lg">{formatCurrency(totalCost)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost Metrics</CardTitle>
            <CardDescription>Unit economics for this production run</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Cost per Dough</span>
              <span className="font-semibold">{formatCurrency(costPerDough)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Cost per Cake</span>
              <span className="font-semibold">{formatCurrency(costPerCake)}</span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Cakes per Dough</span>
                <span className="font-semibold">
                  {run.doughs_produced > 0 ? (totalCakes / run.doughs_produced).toFixed(1) : '0'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Outputs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Production Outputs</CardTitle>
          <CardDescription>Breakdown of cakes produced in this run</CardDescription>
        </CardHeader>
        <CardContent>
          <RunOutputTable outputs={run.production_run_outputs} />
        </CardContent>
      </Card>

      {/* Notes */}
      {run.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{run.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
