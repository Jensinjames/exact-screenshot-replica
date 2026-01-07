import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { CustomerType } from '@/types';

interface CreateCustomerParams {
  name: string;
  customerType: CustomerType;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export function useCreateCustomer(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      customerType,
      email,
      phone,
      address,
      notes,
    }: CreateCustomerParams) => {
      if (!name.trim()) throw new Error('Please enter a customer name');

      const { data, error } = await supabase.from('customers').insert({
        name: name.trim(),
        customer_type: customerType,
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        notes: notes?.trim() || null,
      }).select().single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer created successfully!');
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
