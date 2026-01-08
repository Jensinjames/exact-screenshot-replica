import { z } from 'zod';

export const customerSchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'Customer name is required')
    .max(100, 'Name must be less than 100 characters'),
  customerType: z.enum(['retail', 'wholesale'], {
    required_error: 'Please select a customer type',
  }),
  email: z.string()
    .trim()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters')
    .optional()
    .or(z.literal('')),
  phone: z.string()
    .trim()
    .max(20, 'Phone must be less than 20 characters')
    .optional()
    .or(z.literal('')),
  address: z.string()
    .trim()
    .max(500, 'Address must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  notes: z.string()
    .trim()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
});

export type CustomerFormData = z.infer<typeof customerSchema>;
