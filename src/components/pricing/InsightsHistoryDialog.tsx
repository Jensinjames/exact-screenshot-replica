import { useState } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { History, Trash2, Eye, Calendar, DollarSign, ShoppingCart, Package, Lightbulb, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  usePricingInsightsHistory,
  useDeletePricingInsight,
  type PricingInsightHistoryItem,
} from '@/hooks/pricing/usePricingInsightsHistory';
import type { PricingInsights } from '@/hooks/pricing/usePricingInsights';
import { formatCurrency } from '@/utils/formatters';

interface InsightsHistoryDialogProps {
  onSelectInsight: (insights: PricingInsights) => void;
}

export function InsightsHistoryDialog({ onSelectInsight }: InsightsHistoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: history, isLoading } = usePricingInsightsHistory();
  const { mutate: deleteInsight, isPending: isDeleting } = useDeletePricingInsight();

  const handleView = (item: PricingInsightHistoryItem) => {
    onSelectInsight(item.insights);
    setOpen(false);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteInsight(deleteId);
      setDeleteId(null);
    }
  };

  const formatDateRange = (start: string | null, end: string | null) => {
    if (!start && !end) return 'All Time';
    if (start && end) {
      return `${format(new Date(start), 'MMM d')} - ${format(new Date(end), 'MMM d, yyyy')}`;
    }
    if (start) return `From ${format(new Date(start), 'MMM d, yyyy')}`;
    if (end) return `Until ${format(new Date(end), 'MMM d, yyyy')}`;
    return 'All Time';
  };

  const historyCount = history?.length || 0;

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <History className="mr-1 h-4 w-4" />
            History
            {historyCount > 0 && (
              <Badge variant="secondary" className="ml-1.5 px-1.5 py-0 text-xs">
                {historyCount}
              </Badge>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Pricing Insights History
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh]">
            {isLoading ? (
              <div className="space-y-3 p-1">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-lg border p-4">
                    <Skeleton className="mb-2 h-5 w-48" />
                    <Skeleton className="mb-3 h-4 w-32" />
                    <div className="flex gap-4">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : history && history.length > 0 ? (
              <div className="space-y-3 p-1">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {format(new Date(item.created_at), 'MMM d, yyyy \'at\' h:mm a')}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(item)}
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => setDeleteId(item.id)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="mb-3 text-sm text-muted-foreground">
                      Date Range: {formatDateRange(item.date_range_start, item.date_range_end)}
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">
                          {formatCurrency(item.analytics_summary.totalRevenue)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ShoppingCart className="h-3 w-3 text-muted-foreground" />
                        <span>{item.analytics_summary.totalOrders} orders</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Package className="h-3 w-3 text-muted-foreground" />
                        <span>{item.analytics_summary.totalQuantity} units</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Lightbulb className="h-3 w-3 text-muted-foreground" />
                        <span>{item.insights.recommendations.length} recommendations</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 text-muted-foreground" />
                        <span>{item.insights.riskFactors.length} risks</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <History className="mb-3 h-10 w-10 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground">
                  No insights history yet. Generate insights to start building your history.
                </p>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Insight</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this insight from your history? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
