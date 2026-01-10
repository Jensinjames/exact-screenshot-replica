import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { PricingInsights } from './usePricingInsights';

export interface PricingInsightHistoryItem {
  id: string;
  created_at: string;
  created_by: string | null;
  date_range_start: string | null;
  date_range_end: string | null;
  analytics_summary: {
    totalRevenue: number;
    totalOrders: number;
    totalQuantity: number;
    averageOrderValue: number;
  };
  insights: PricingInsights;
}

export function usePricingInsightsHistory() {
  return useQuery({
    queryKey: ['pricing-insights-history'],
    queryFn: async (): Promise<PricingInsightHistoryItem[]> => {
      const { data, error } = await supabase
        .from('pricing_insights_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        throw new Error(error.message);
      }

      return (data || []).map(item => ({
        ...item,
        analytics_summary: item.analytics_summary as unknown as PricingInsightHistoryItem['analytics_summary'],
        insights: item.insights as unknown as PricingInsights,
      }));
    },
  });
}

export function useDeletePricingInsight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pricing_insights_history')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-insights-history'] });
      toast.success('Insight deleted from history');
    },
    onError: (error: Error) => {
      console.error('Failed to delete insight:', error);
      toast.error('Failed to delete insight');
    },
  });
}
