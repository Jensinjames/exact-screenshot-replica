import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProducts, useCustomers, type CakeSize, type CakeVariety, type CustomerType } from '@/hooks/useData';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { toast } from 'sonner';
import { ArrowLeft, CalendarIcon, Plus, Trash2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface OrderItemInput {
  id: string;
  size: CakeSize;
  variety: CakeVariety;
  quantity: number;
}

export default function NewOrder() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: products } = useProducts();
  const { data: customers } = useCustomers();

  const [customerType, setCustomerType] = useState<CustomerType>('retail');
  const [customerId, setCustomerId] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [pickupDate, setPickupDate] = useState<Date>();
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<OrderItemInput[]>([
    { id: crypto.randomUUID(), size: 'medium', variety: 'traditional', quantity: 1 },
  ]);

  const getPrice = (size: CakeSize, variety: CakeVariety): number => {
    const product = products?.find((p) => p.size === size && p.variety === variety);
    if (!product) return 0;
    return customerType === 'wholesale' ? Number(product.wholesale_price) : Number(product.retail_price);
  };

  const calculateTotal = (): number => {
    return items.reduce((sum, item) => {
      return sum + getPrice(item.size, item.variety) * item.quantity;
    }, 0);
  };

  const addItem = () => {
    setItems([
      ...items,
      { id: crypto.randomUUID(), size: 'medium', variety: 'traditional', quantity: 1 },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof OrderItemInput, value: any) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      if (!pickupDate) throw new Error('Please select a pickup date');
      if (!customerName.trim()) throw new Error('Please enter a customer name');

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: customerId || null,
          customer_name: customerName,
          customer_type: customerType,
          pickup_date: pickupDate.toISOString().split('T')[0],
          notes: notes || null,
          total_amount: calculateTotal(),
          created_by: user?.id,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => {
        const product = products?.find(
          (p) => p.size === item.size && p.variety === item.variety
        );
        const unitPrice = getPrice(item.size, item.variety);
        
        return {
          order_id: order.id,
          product_id: product?.id || null,
          size: item.size,
          variety: item.variety,
          quantity: item.quantity,
          unit_price: unitPrice,
          total_price: unitPrice * item.quantity,
        };
      });

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      return order;
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
      toast.success('Order created successfully!');
      navigate(`/orders/${order.id}`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSelectCustomer = (id: string) => {
    setCustomerId(id);
    const customer = customers?.find((c) => c.id === id);
    if (customer) {
      setCustomerName(customer.name);
      setCustomerType(customer.customer_type);
    }
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

      <form
        onSubmit={(e) => {
          e.preventDefault();
          createOrderMutation.mutate();
        }}
        className="space-y-6"
      >
        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Customer Type</Label>
                <Select value={customerType} onValueChange={(v) => setCustomerType(v as CustomerType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="wholesale">Wholesale</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Existing Customer (Optional)</Label>
                <Select value={customerId} onValueChange={handleSelectCustomer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer..." />
                  </SelectTrigger>
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
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer-name">Customer Name *</Label>
              <Input
                id="customer-name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Pickup Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !pickupDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {pickupDate ? format(pickupDate, 'PPP') : 'Select pickup date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={pickupDate}
                    onSelect={setPickupDate}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
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
            {items.map((item, index) => (
              <div
                key={item.id}
                className="grid grid-cols-12 gap-3 items-end p-4 rounded-lg border border-border"
              >
                <div className="col-span-12 sm:col-span-4 space-y-2">
                  <Label>Size</Label>
                  <Select
                    value={item.size}
                    onValueChange={(v) => updateItem(item.id, 'size', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mini">Mini</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                      <SelectItem value="super">Super</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-12 sm:col-span-4 space-y-2">
                  <Label>Variety</Label>
                  <Select
                    value={item.variety}
                    onValueChange={(v) => updateItem(item.id, 'variety', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="traditional">Traditional</SelectItem>
                      <SelectItem value="filled">Filled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-8 sm:col-span-2 space-y-2">
                  <Label>Qty</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)
                    }
                  />
                </div>

                <div className="col-span-4 sm:col-span-2 flex items-center justify-between gap-2">
                  <span className="font-medium">
                    ${(getPrice(item.size, item.variety) * item.quantity).toFixed(2)}
                  </span>
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}

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
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any special instructions or notes..."
              rows={3}
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
    </div>
  );
}
