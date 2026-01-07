import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useInventory } from '@/hooks/inventory';
import type { Inventory as InventoryType } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, Search, Package, AlertTriangle, Loader2, Minus } from 'lucide-react';

export default function Inventory() {
  const { data: inventory, isLoading } = useInventory();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryType | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState('');

  // Add form state
  const [newName, setNewName] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [newThreshold, setNewThreshold] = useState('');
  const [newCost, setNewCost] = useState('');

  const resetAddForm = () => {
    setNewName('');
    setNewQuantity('');
    setNewUnit('');
    setNewThreshold('');
    setNewCost('');
  };

  const addItemMutation = useMutation({
    mutationFn: async () => {
      if (!newName.trim()) throw new Error('Please enter an item name');
      if (!newUnit.trim()) throw new Error('Please enter a unit');

      const { error } = await supabase.from('inventory').insert({
        name: newName.trim(),
        quantity: parseFloat(newQuantity) || 0,
        unit: newUnit.trim(),
        low_stock_threshold: parseFloat(newThreshold) || 0,
        cost_per_unit: newCost ? parseFloat(newCost) : null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
      toast.success('Item added to inventory');
      setIsAddDialogOpen(false);
      resetAddForm();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const adjustQuantityMutation = useMutation({
    mutationFn: async ({ itemId, newQty }: { itemId: string; newQty: number }) => {
      const { error } = await supabase
        .from('inventory')
        .update({ quantity: newQty })
        .eq('id', itemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
      toast.success('Quantity updated');
      setIsAdjustDialogOpen(false);
      setSelectedItem(null);
      setAdjustmentAmount('');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const openAdjustDialog = (item: InventoryType) => {
    setSelectedItem(item);
    setAdjustmentAmount(item.quantity.toString());
    setIsAdjustDialogOpen(true);
  };

  const filteredInventory = inventory?.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockItems = inventory?.filter(
    (item) => Number(item.quantity) <= Number(item.low_stock_threshold)
  ) || [];

  const getStockLevel = (item: InventoryType): { percent: number; status: 'good' | 'low' | 'critical' } => {
    const qty = Number(item.quantity);
    const threshold = Number(item.low_stock_threshold);
    
    if (threshold === 0) return { percent: 100, status: 'good' };
    
    const percent = Math.min((qty / (threshold * 3)) * 100, 100);
    
    if (qty <= threshold) return { percent, status: 'critical' };
    if (qty <= threshold * 1.5) return { percent, status: 'low' };
    return { percent, status: 'good' };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Inventory</h1>
          <p className="text-muted-foreground">Track your ingredient stock levels</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Add Inventory Item</DialogTitle>
              <DialogDescription>Add a new ingredient or supply to track.</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addItemMutation.mutate();
              }}
              className="space-y-4 mt-4"
            >
              <div className="space-y-2">
                <Label htmlFor="item-name">Name *</Label>
                <Input
                  id="item-name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., All-Purpose Flour"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.01"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit *</Label>
                  <Input
                    id="unit"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    placeholder="lbs, oz, count"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="threshold">Low Stock Alert</Label>
                  <Input
                    id="threshold"
                    type="number"
                    step="0.01"
                    value={newThreshold}
                    onChange={(e) => setNewThreshold(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost">Cost per Unit</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={newCost}
                    onChange={(e) => setNewCost(e.target.value)}
                    placeholder="$0.00"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addItemMutation.isPending}>
                  {addItemMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Add Item'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <CardTitle className="text-lg">Low Stock Alert</CardTitle>
            </div>
            <CardDescription>
              {lowStockItems.length} item(s) need restocking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {lowStockItems.map((item) => (
                <Button
                  key={item.id}
                  variant="outline"
                  size="sm"
                  onClick={() => openAdjustDialog(item)}
                  className="border-destructive/50 text-destructive hover:bg-destructive/10"
                >
                  {item.name}: {item.quantity} {item.unit}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading inventory...</div>
          ) : filteredInventory && filteredInventory.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Stock Level</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Low Alert</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.map((item) => {
                    const stock = getStockLevel(item);
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="w-[200px]">
                          <div className="flex items-center gap-2">
                            <Progress
                              value={stock.percent}
                              className={`h-2 ${
                                stock.status === 'critical'
                                  ? '[&>div]:bg-destructive'
                                  : stock.status === 'low'
                                  ? '[&>div]:bg-secondary'
                                  : '[&>div]:bg-accent'
                              }`}
                            />
                            {stock.status === 'critical' && (
                              <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-medium">{item.quantity}</span>{' '}
                          <span className="text-muted-foreground">{item.unit}</span>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {item.low_stock_threshold} {item.unit}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openAdjustDialog(item)}
                          >
                            Adjust
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="mb-4">No inventory items found</p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add your first item
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Adjust Quantity Dialog */}
      <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
        <DialogContent className="sm:max-w-[300px]">
          <DialogHeader>
            <DialogTitle>Adjust Quantity</DialogTitle>
            <DialogDescription>{selectedItem?.name}</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (selectedItem) {
                adjustQuantityMutation.mutate({
                  itemId: selectedItem.id,
                  newQty: parseFloat(adjustmentAmount) || 0,
                });
              }
            }}
            className="space-y-4 mt-4"
          >
            <div className="space-y-2">
              <Label htmlFor="new-qty">New Quantity ({selectedItem?.unit})</Label>
              <Input
                id="new-qty"
                type="number"
                step="0.01"
                value={adjustmentAmount}
                onChange={(e) => setAdjustmentAmount(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsAdjustDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={adjustQuantityMutation.isPending}>
                {adjustQuantityMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Update'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
