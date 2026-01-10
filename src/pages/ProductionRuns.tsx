import { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Plus, Factory, DollarSign, Package, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useProductionRuns } from '@/hooks/production/useProductionRuns';
import { CreateRunDialog } from '@/components/production/CreateRunDialog';
import { formatCurrency } from '@/utils/formatters';

export default function ProductionRuns() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { data: runs, isLoading, error } = useProductionRuns();

  // Calculate summary stats
  const totalRuns = runs?.length || 0;
  const totalDoughs = runs?.reduce((sum, r) => sum + Number(r.doughs_produced), 0) || 0;
  const totalCakes = runs?.reduce((sum, r) => 
    sum + r.production_run_outputs.reduce((s, o) => s + o.quantity_produced, 0), 0
  ) || 0;
  const totalCosts = runs?.reduce((sum, r) => 
    sum + Number(r.labor_cost || 0) + Number(r.ingredient_cost || 0), 0
  ) || 0;

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-destructive">
          Failed to load production runs. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Production Runs</h1>
          <p className="text-muted-foreground">
            Track production batches, costs, and outputs
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Run
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Runs</CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{totalRuns}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doughs Produced</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{totalDoughs}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cakes Produced</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{totalCakes}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Costs</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">{formatCurrency(totalCosts)}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Runs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Production Run History</CardTitle>
          <CardDescription>All production runs with their outputs and costs</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : runs && runs.length > 0 ? (
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
                    (sum, o) => sum + o.quantity_produced, 0
                  );
                  const totalCost = Number(run.labor_cost || 0) + Number(run.ingredient_cost || 0);
                  
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

      <CreateRunDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  );
}
