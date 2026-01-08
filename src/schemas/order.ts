import { z } from 'zod';

export const orderItemSchema = z.object({
  id: z.string(),
  size: z.enum(['mini', 'medium', 'large', 'super']),
  variety: z.enum(['traditional', 'filled']),
  quantity: z.coerce.number()
    .min(1, 'Quantity must be at least 1')
    .max(999, 'Quantity cannot exceed 999'),
});

export const orderSchema = z.object({
  customerType: z.enum(['retail', 'wholesale']),
  customerId: z.string().optional(),
  customerName: z.string()
    .trim()
    .min(1, 'Customer name is required')
    .max(100, 'Name must be less than 100 characters'),
  pickupDate: z.date({
    required_error: 'Please select a pickup date',
  }),
  notes: z.string()
    .trim()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
  items: z.array(orderItemSchema)
    .min(1, 'At least one item is required'),
});

export type OrderFormData = z.infer<typeof orderSchema>;
export type OrderItemFormData = z.infer<typeof orderItemSchema>;
