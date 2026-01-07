// Re-export all hooks and types from new modular structure for backward compatibility
// This file is deprecated - prefer importing from specific hook folders

export { useProducts } from './products';
export { useOrders, useOrder } from './orders';
export { useCustomers, useCustomer } from './customers';
export { useInventory } from './inventory';
export { useProductionPlan } from './production';
export { useDashboardStats } from './dashboard';

// Re-export types for backward compatibility
export type {
  Product,
  Order,
  OrderItem,
  Customer,
  Inventory,
  ProductionPlan,
  OrderStatus,
  CustomerType,
  CakeSize,
  CakeVariety,
} from '@/types';
