import type { Product, CakeSize, CakeVariety, CustomerType } from '@/types';

/**
 * Get the price for a cake based on size, variety, and customer type
 */
export function getPrice(
  products: Product[] | undefined,
  size: CakeSize,
  variety: CakeVariety,
  customerType: CustomerType
): number {
  const product = products?.find((p) => p.size === size && p.variety === variety);
  if (!product) return 0;
  return customerType === 'wholesale' 
    ? Number(product.wholesale_price) 
    : Number(product.retail_price);
}

/**
 * Calculate total for order items
 */
export function calculateOrderTotal(
  items: Array<{ size: CakeSize; variety: CakeVariety; quantity: number }>,
  products: Product[] | undefined,
  customerType: CustomerType
): number {
  return items.reduce((sum, item) => {
    return sum + getPrice(products, item.size, item.variety, customerType) * item.quantity;
  }, 0);
}
