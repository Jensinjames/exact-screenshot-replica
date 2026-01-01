import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useProductionPlan, useProducts, type CakeSize, type CakeVariety } from '@/hooks/useData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CalendarIcon, ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';

interface ProductionSummary {
  size: CakeSize;
  variety: CakeVariety;
  quantity: number;
  doughsNeeded: number;
}

export default function Production() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { data, isLoading } = useProductionPlan(selectedDate);
  const { data: products } = useProducts();

  // Calculate production summary from orders
  const productionSummary = useMemo(() => {
    if (!data?.orders || !products) return [];

    const summary: Record<string, ProductionSummary> = {};

    data.orders.forEach((order: any) => {
      order.order_items?.forEach((item: any) => {
        const key = `${item.size}-${item.variety}`;
        const product = products.find(
          (p) => p.size === item.size && p.variety === item.variety
        );

        if (!summary[key]) {
          summary[key] = {
            size: item.size,
            variety: item.variety,
            quantity: 0,
            doughsNeeded: 0,
          };
        }

        summary[key].quantity += item.quantity;
        summary[key].doughsNeeded += item.quantity * (product?.doughs_required || 1);
      });
    });

    return Object.values(summary).sort((a, b) => {
      const sizeOrder = { mini: 0, medium: 1, large: 2, super: 3 };
      return sizeOrder[a.size] - sizeOrder[b.size];
    });
  }, [data?.orders, products]);

  const totalDoughs = productionSummary.reduce((sum, item) => sum + item.doughsNeeded, 0);
  const totalCakes = productionSummary.reduce((sum, item) => sum + item.quantity, 0);

  const goToPreviousDay = () => setSelectedDate(subDays(selectedDate, 1));
  const goToNextDay = () => setSelectedDate(addDays(selectedDate, 1));
  const goToToday = () => setSelectedDate(new Date());

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Date Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Production Plan</h1>
          <p className="text-muted-foreground">
            Daily production planning based on orders
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPreviousDay}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="min-w-[200px]">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedDate, 'EEEE, MMM d')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Button variant="outline" size="icon" onClick={goToNextDay}>
            <ChevronRight className="w-4 h-4" />
          </Button>

          <Button variant="ghost" onClick={goToToday}>
            Today
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="gradient-primary text-primary-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Cakes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{totalCakes}</div>
            <p className="text-sm opacity-80 mt-1">for {format(selectedDate, 'MMM d')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Doughs Needed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{totalDoughs.toFixed(1)}</div>
            <p className="text-sm text-muted-foreground mt-1">batches of dough</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{data?.orders?.length || 0}</div>
            <p className="text-sm text-muted-foreground mt-1">to fulfill</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Production Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Production Breakdown</CardTitle>
            <CardDescription>Cakes needed by size and variety</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : productionSummary.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead className="text-right">Doughs</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productionSummary.map((item) => (
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

        {/* Orders for the Day */}
        <Card>
          <CardHeader>
            <CardTitle>Orders for {format(selectedDate, 'MMM d')}</CardTitle>
            <CardDescription>All orders scheduled for pickup</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : data?.orders && data.orders.length > 0 ? (
              <div className="space-y-3">
                {data.orders.map((order: any) => (
                  <Link
                    key={order.id}
                    to={`/orders/${order.id}`}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{order.order_number}</span>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {order.customer_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.order_items?.length || 0} item(s)
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="capitalize">
                        {order.customer_type}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No orders scheduled</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ingredient Estimates */}
      {productionSummary.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Estimated Ingredient Requirements</CardTitle>
            <CardDescription>
              Based on {totalDoughs.toFixed(1)} doughs (approximate)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { name: 'Flour', amount: (totalDoughs * 3).toFixed(1), unit: 'lbs' },
                { name: 'Butter', amount: (totalDoughs * 0.75).toFixed(2), unit: 'lbs' },
                { name: 'Sugar', amount: (totalDoughs * 0.5).toFixed(2), unit: 'lbs' },
                { name: 'Eggs', amount: Math.ceil(totalDoughs * 4), unit: 'count' },
                { name: 'Milk', amount: (totalDoughs * 0.5).toFixed(2), unit: 'cups' },
                { name: 'Yeast', amount: (totalDoughs * 0.25).toFixed(2), unit: 'oz' },
              ].map((ingredient) => (
                <div
                  key={ingredient.name}
                  className="p-3 rounded-lg bg-muted/50 text-center"
                >
                  <p className="text-sm text-muted-foreground">{ingredient.name}</p>
                  <p className="text-lg font-semibold">
                    {ingredient.amount} <span className="text-sm font-normal text-muted-foreground">{ingredient.unit}</span>
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
