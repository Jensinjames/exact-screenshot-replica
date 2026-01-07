// Centralized type definitions derived from Supabase schema
import type { Database } from '@/integrations/supabase/types';

// Table types
export type Product = Database['public']['Tables']['products']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];
export type Customer = Database['public']['Tables']['customers']['Row'];
export type Inventory = Database['public']['Tables']['inventory']['Row'];
export type ProductionPlan = Database['public']['Tables']['production_plans']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type TeamMembership = Database['public']['Tables']['team_memberships']['Row'];
export type TeamInvitation = Database['public']['Tables']['team_invitations']['Row'];

// Enum types
export type OrderStatus = Database['public']['Enums']['order_status'];
export type CustomerType = Database['public']['Enums']['customer_type'];
export type CakeSize = Database['public']['Enums']['cake_size'];
export type CakeVariety = Database['public']['Enums']['cake_variety'];
export type TeamRole = Database['public']['Enums']['team_role'];

// Composite types for queries with relations
export type OrderWithItems = Order & {
  order_items: OrderItem[];
};

export type OrderWithDetails = Order & {
  order_items: OrderItem[];
  customers: Customer | null;
};

export type CustomerWithOrders = Customer & {
  orders: OrderWithItems[];
};

export type TeamMemberWithProfile = TeamMembership & {
  profiles: Pick<Profile, 'full_name' | 'avatar_url'> | null;
};
