import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { customerSchema, type CustomerFormData } from '@/schemas';
import { CustomerFormFields } from './CustomerFormFields';
import { useCreateCustomer, useUpdateCustomer } from '@/hooks/customers';
import type { Customer } from '@/types';

interface CustomerFormDialogProps {
  mode: 'create' | 'edit';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer | null;
}

export function CustomerFormDialog({ 
  mode, 
  open, 
  onOpenChange, 
  customer 
}: CustomerFormDialogProps) {
  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: customer?.name || '',
      customerType: customer?.customer_type || 'retail',
      email: customer?.email || '',
      phone: customer?.phone || '',
      address: customer?.address || '',
      notes: customer?.notes || '',
    },
  });

  const createMutation = useCreateCustomer({
    onSuccess: () => {
      onOpenChange(false);
      form.reset();
    },
  });

  const updateMutation = useUpdateCustomer();

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
  };

  const onSubmit = (data: CustomerFormData) => {
    if (mode === 'create') {
      createMutation.mutate({
        name: data.name,
        customerType: data.customerType,
        email: data.email,
        phone: data.phone,
        address: data.address,
        notes: data.notes,
      });
    } else if (customer) {
      updateMutation.mutate(
        { id: customer.id, data },
        {
          onSuccess: () => {
            onOpenChange(false);
            form.reset();
          },
        }
      );
    }
  };

  const isPending = mode === 'create' 
    ? createMutation.isPending 
    : updateMutation.isPending;

  // Reset form when customer changes (for edit mode)
  if (mode === 'edit' && customer && form.getValues('name') !== customer.name) {
    form.reset({
      name: customer.name,
      customerType: customer.customer_type,
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      notes: customer.notes || '',
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add New Customer' : 'Edit Customer'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Create a new customer record for orders.'
              : 'Update customer information.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <CustomerFormFields form={form} />
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {mode === 'create' ? 'Creating...' : 'Saving...'}
                  </>
                ) : (
                  mode === 'create' ? 'Create Customer' : 'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
