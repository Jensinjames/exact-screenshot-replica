import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateProductionRun, type ProductionOutput } from '@/hooks/production/useCreateProductionRun';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Constants } from '@/integrations/supabase/types';
import type { CakeSize, CakeVariety } from '@/types/database';

const formSchema = z.object({
  run_date: z.date({ required_error: 'Please select a date' }),
  doughs_produced: z.coerce.number().min(1, 'Must produce at least 1 dough'),
  labor_cost: z.coerce.number().min(0).optional(),
  ingredient_cost: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateRunDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateRunDialog({ open, onOpenChange }: CreateRunDialogProps) {
  const [outputs, setOutputs] = useState<ProductionOutput[]>([]);
  const { toast } = useToast();
  const createRun = useCreateProductionRun();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      run_date: new Date(),
      doughs_produced: 1,
      labor_cost: 0,
      ingredient_cost: 0,
      notes: '',
    },
  });

  const addOutput = () => {
    setOutputs([...outputs, { size: 'mini', variety: 'traditional', quantity_produced: 1 }]);
  };

  const removeOutput = (index: number) => {
    setOutputs(outputs.filter((_, i) => i !== index));
  };

  const updateOutput = (index: number, field: keyof ProductionOutput, value: string | number) => {
    const newOutputs = [...outputs];
    if (field === 'quantity_produced') {
      newOutputs[index] = { ...newOutputs[index], quantity_produced: Number(value) };
    } else if (field === 'size') {
      newOutputs[index] = { ...newOutputs[index], size: value as CakeSize };
    } else if (field === 'variety') {
      newOutputs[index] = { ...newOutputs[index], variety: value as CakeVariety };
    }
    setOutputs(newOutputs);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      await createRun.mutateAsync({
        run_date: format(values.run_date, 'yyyy-MM-dd'),
        doughs_produced: values.doughs_produced,
        labor_cost: values.labor_cost,
        ingredient_cost: values.ingredient_cost,
        notes: values.notes,
        outputs,
      });
      toast({ title: 'Production run created successfully' });
      form.reset();
      setOutputs([]);
      onOpenChange(false);
    } catch (error) {
      toast({ 
        title: 'Failed to create production run', 
        variant: 'destructive' 
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Production Run</DialogTitle>
          <DialogDescription>
            Record a new production run with costs and outputs
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="run_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Run Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="doughs_produced"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Doughs Produced</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="labor_cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Labor Cost ($)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ingredient_cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ingredient Cost ($)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Optional notes about this run..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Production Outputs</h4>
                <Button type="button" variant="outline" size="sm" onClick={addOutput}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Output
                </Button>
              </div>
              
              {outputs.map((output, index) => (
                <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                  <Select
                    value={output.size}
                    onValueChange={(value) => updateOutput(index, 'size', value)}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Size" />
                    </SelectTrigger>
                    <SelectContent>
                      {Constants.public.Enums.cake_size.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size.charAt(0).toUpperCase() + size.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={output.variety}
                    onValueChange={(value) => updateOutput(index, 'variety', value)}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Variety" />
                    </SelectTrigger>
                    <SelectContent>
                      {Constants.public.Enums.cake_variety.map((variety) => (
                        <SelectItem key={variety} value={variety}>
                          {variety.charAt(0).toUpperCase() + variety.slice(1).replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min={1}
                    value={output.quantity_produced}
                    onChange={(e) => updateOutput(index, 'quantity_produced', e.target.value)}
                    className="w-[100px]"
                    placeholder="Qty"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOutput(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              {outputs.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg">
                  No outputs added yet. Click "Add Output" to record what was produced.
                </p>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createRun.isPending}>
                {createRun.isPending ? 'Creating...' : 'Create Run'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
