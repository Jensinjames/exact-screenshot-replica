import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import type { Inventory } from '@/types';

interface InventoryAlertsProps {
  items: Inventory[];
}

export function InventoryAlerts({ items }: InventoryAlertsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Inventory Alerts</CardTitle>
          <CardDescription>Items running low on stock</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/inventory">
            View All
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {items.length > 0 ? (
          <div className="space-y-3">
            {items.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg border border-destructive/30 bg-destructive/5"
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Threshold: {item.low_stock_threshold} {item.unit}
                  </p>
                </div>
                <Badge variant="destructive">
                  {item.quantity} {item.unit}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={AlertTriangle}
            title="All inventory levels are good!"
          />
        )}
      </CardContent>
    </Card>
  );
}
