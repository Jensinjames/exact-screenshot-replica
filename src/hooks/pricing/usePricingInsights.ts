import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { PricingAnalytics } from './usePricingAnalytics';

export interface PricingInsights {
  summary: string;
  keyObservations: string[];
  recommendations: {
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    action: string;
  }[];
  riskFactors: string[];
  potentialRevenue: string;
}

export function usePricingInsights() {
  return useMutation({
    mutationFn: async (analyticsData: PricingAnalytics): Promise<PricingInsights> => {
      const { data, error } = await supabase.functions.invoke('pricing-insights', {
        body: { analyticsData },
      });

      if (error) {
        throw new Error(error.message || 'Failed to generate insights');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (!data?.insights) {
        throw new Error('No insights returned from AI');
      }

      return data.insights;
    },
    onError: (error: Error) => {
      console.error('Pricing insights error:', error);
      
      if (error.message.includes('Rate limit')) {
        toast.error('Rate limit exceeded. Please wait a moment and try again.');
      } else if (error.message.includes('credits')) {
        toast.error('AI credits exhausted. Please add funds to continue.');
      } else {
        toast.error('Failed to generate pricing insights. Please try again.');
      }
    },
  });
}
