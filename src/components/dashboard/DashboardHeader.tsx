import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface DashboardHeaderProps {
  currentDate: Date;
}

export function DashboardHeader({ currentDate }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-display font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          {format(currentDate, 'EEEE, MMMM d, yyyy')}
        </p>
      </div>
      <div className="flex gap-3">
        <Button asChild>
          <Link to="/orders/new">
            <Plus className="w-4 h-4 mr-2" />
            New Order
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/production">
            <Calendar className="w-4 h-4 mr-2" />
            Today's Plan
          </Link>
        </Button>
      </div>
    </div>
  );
}
