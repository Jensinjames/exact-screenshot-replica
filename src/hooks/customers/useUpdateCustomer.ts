import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { CustomerFormData } from '@/schemas';

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CustomerFormData }) => {
      const { error } = await supabase
        .from('customers')
        .update({
          name: data.name,
          customer_type: data.customerType,
          email: data.email || null,
          phone: data.phone || null,
          address: data.address || null,
          notes: data.notes || null,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}
