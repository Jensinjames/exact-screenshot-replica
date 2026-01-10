import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useProducts } from '@/hooks/products';
import { useCustomers } from '@/hooks/customers';
import { useCreateOrder } from '@/hooks/orders';
import { orderSchema, type OrderFormData } from '@/schemas';
import type { CakeSize, CakeVariety } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { getPrice, calculateOrderTotal } from '@/utils/pricing';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { ArrowLeft, CalendarIcon, Plus, Trash2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function NewOrder() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: products } = useProducts();
  const { data: customers } = useCustomers();
  const createOrderMutation = useCreateOrder();

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customerType: 'retail',
      customerId: '',
      customerName: '',
      pickupDate: undefined,
      notes: '',
      items: [{ id: crypto.randomUUID(), size: 'medium', variety: 'traditional', quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const customerType = form.watch('customerType');
  const items = form.watch('items');

  const getItemPrice = (size: CakeSize, variety: CakeVariety): number => {
    return getPrice(products, size, variety, customerType);
  };

  const calculateTotal = (): number => {
    const validItems = items.filter((item): item is { size: CakeSize; variety: CakeVariety; quantity: number } => 
      !!item.size && !!item.variety && typeof item.quantity === 'number'
    );
    return calculateOrderTotal(validItems, products, customerType);
  };

  const addItem = () => {
    append({ id: crypto.randomUUID(), size: 'medium', variety: 'traditional', quantity: 1 });
  };

  const handleSelectCustomer = (id: string) => {
    form.setValue('customerId', id);
    const customer = customers?.find((c) => c.id === id);
    if (customer) {
      form.setValue('customerName', customer.name);
      form.setValue('customerType', customer.customer_type);
    }
  };

  const onSubmit = (data: OrderFormData) => {
    createOrderMutation.mutate({
      customerId: data.customerId || null,
      customerName: data.customerName,
      customerType: data.customerType,
      pickupDate: data.pickupDate,
      notes: data.notes || '',
      items: data.items.map(item => ({
        id: item.id || crypto.randomUUID(),
        size: item.size as CakeSize,
        variety: item.variety as CakeVariety,
        quantity: item.quantity || 1,
      })),
      products,
      userId: user?.id,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-display font-bold">New Order</h1>
          <p className="text-muted-foreground">Create a new customer order</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="customerType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="wholesale">Wholesale</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Existing Customer (Optional)</FormLabel>
                      <Select onValueChange={handleSelectCustomer} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select customer..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {customers
                            ?.filter((c) => c.customer_type === customerType)
                            .map((customer) => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter customer name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pickupDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pickup Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full justify-start text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, 'PPP') : 'Select pickup date'}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Order Items</CardTitle>
                <CardDescription>
                  {customerType === 'wholesale' ? 'Wholesale pricing applied' : 'Retail pricing applied'}
                </CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-12 gap-3 items-end p-4 rounded-lg border border-border"
                >
                  <FormField
                    control={form.control}
                    name={`items.${index}.size`}
                    render={({ field }) => (
                      <FormItem className="col-span-12 sm:col-span-4">
                        <FormLabel>Size</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="mini">Mini</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="large">Large</SelectItem>
                            <SelectItem value="super">Super</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`items.${index}.variety`}
                    render={({ field }) => (
                      <FormItem className="col-span-12 sm:col-span-4">
                        <FormLabel>Variety</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="traditional">Traditional</SelectItem>
                            <SelectItem value="filled">Filled</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`items.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem className="col-span-8 sm:col-span-2">
                        <FormLabel>Qty</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="col-span-4 sm:col-span-2 flex items-center justify-between gap-2">
                    <span className="font-medium">
                      ${(getItemPrice(items[index]?.size as CakeSize, items[index]?.variety as CakeVariety) * (items[index]?.quantity || 1)).toFixed(2)}
                    </span>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {form.formState.errors.items?.root && (
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.items.root.message}
                </p>
              )}

              <div className="flex justify-end pt-4 border-t border-border">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">${calculateTotal().toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Add any special instructions or notes..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createOrderMutation.isPending}>
              {createOrderMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Order'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
