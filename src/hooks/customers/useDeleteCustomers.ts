import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useDeleteCustomers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customerIds: string[]) => {
      const { error } = await supabase
        .from('customers')
        .delete()
        .in('id', customerIds);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}
