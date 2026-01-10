import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProductionRuns } from '@/hooks/production/useProductionRuns';
import {
  CreateRunDialog,
  ProductionRunsStats,
  ProductionRunsTable,
} from '@/components/production';

export default function ProductionRuns() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { data: runs, isLoading, error } = useProductionRuns();

  // Calculate summary stats
  const totalRuns = runs?.length || 0;
  const totalDoughs = runs?.reduce((sum, r) => sum + Number(r.doughs_produced), 0) || 0;
  const totalCakes =
    runs?.reduce(
      (sum, r) => sum + r.production_run_outputs.reduce((s, o) => s + o.quantity_produced, 0),
      0
    ) || 0;
  const totalCosts =
    runs?.reduce(
      (sum, r) => sum + Number(r.labor_cost || 0) + Number(r.ingredient_cost || 0),
      0
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

      <ProductionRunsStats
        totalRuns={totalRuns}
        totalDoughs={totalDoughs}
        totalCakes={totalCakes}
        totalCosts={totalCosts}
        isLoading={isLoading}
      />

      <ProductionRunsTable runs={runs || []} isLoading={isLoading} />

      <CreateRunDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  );
}
