export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      customers: {
        Row: {
          address: string | null
          created_at: string
          customer_type: Database["public"]["Enums"]["customer_type"]
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          customer_type?: Database["public"]["Enums"]["customer_type"]
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          customer_type?: Database["public"]["Enums"]["customer_type"]
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      inventory: {
        Row: {
          cost_per_unit: number | null
          created_at: string
          id: string
          low_stock_threshold: number
          name: string
          quantity: number
          unit: string
          updated_at: string
        }
        Insert: {
          cost_per_unit?: number | null
          created_at?: string
          id?: string
          low_stock_threshold?: number
          name: string
          quantity?: number
          unit: string
          updated_at?: string
        }
        Update: {
          cost_per_unit?: number | null
          created_at?: string
          id?: string
          low_stock_threshold?: number
          name?: string
          quantity?: number
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string | null
          quantity: number
          size: Database["public"]["Enums"]["cake_size"]
          total_price: number
          unit_price: number
          variety: Database["public"]["Enums"]["cake_variety"]
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id?: string | null
          quantity?: number
          size: Database["public"]["Enums"]["cake_size"]
          total_price: number
          unit_price: number
          variety: Database["public"]["Enums"]["cake_variety"]
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string | null
          quantity?: number
          size?: Database["public"]["Enums"]["cake_size"]
          total_price?: number
          unit_price?: number
          variety?: Database["public"]["Enums"]["cake_variety"]
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          created_by: string | null
          customer_id: string | null
          customer_name: string
          customer_type: Database["public"]["Enums"]["customer_type"]
          id: string
          notes: string | null
          order_number: string
          pickup_date: string
          status: Database["public"]["Enums"]["order_status"]
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          customer_name: string
          customer_type?: Database["public"]["Enums"]["customer_type"]
          id?: string
          notes?: string | null
          order_number: string
          pickup_date: string
          status?: Database["public"]["Enums"]["order_status"]
          total_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_type?: Database["public"]["Enums"]["customer_type"]
          id?: string
          notes?: string | null
          order_number?: string
          pickup_date?: string
          status?: Database["public"]["Enums"]["order_status"]
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      production_plans: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          plan_date: string
          retail_buffer: number
          total_doughs: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          plan_date: string
          retail_buffer?: number
          total_doughs?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          plan_date?: string
          retail_buffer?: number
          total_doughs?: number
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          created_at: string
          doughs_required: number
          id: string
          is_active: boolean
          name: string
          retail_price: number
          size: Database["public"]["Enums"]["cake_size"]
          updated_at: string
          variety: Database["public"]["Enums"]["cake_variety"]
          wholesale_price: number
        }
        Insert: {
          created_at?: string
          doughs_required?: number
          id?: string
          is_active?: boolean
          name: string
          retail_price: number
          size: Database["public"]["Enums"]["cake_size"]
          updated_at?: string
          variety: Database["public"]["Enums"]["cake_variety"]
          wholesale_price: number
        }
        Update: {
          created_at?: string
          doughs_required?: number
          id?: string
          is_active?: boolean
          name?: string
          retail_price?: number
          size?: Database["public"]["Enums"]["cake_size"]
          updated_at?: string
          variety?: Database["public"]["Enums"]["cake_variety"]
          wholesale_price?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      cake_size: "mini" | "medium" | "large" | "super"
      cake_variety: "traditional" | "filled"
      customer_type: "retail" | "wholesale"
      order_status:
        | "pending"
        | "in_production"
        | "ready"
        | "fulfilled"
        | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      cake_size: ["mini", "medium", "large", "super"],
      cake_variety: ["traditional", "filled"],
      customer_type: ["retail", "wholesale"],
      order_status: [
        "pending",
        "in_production",
        "ready",
        "fulfilled",
        "cancelled",
      ],
    },
  },
} as const
