import { z } from 'zod';

export const productSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  name: z.string().min(2, 'Product name is required'),
  price: z.number().positive('Price must be greater than zero'),
  sku: z.string().min(3, 'SKU is required'),
});

export type ProductFormValues = z.infer<typeof productSchema>;
