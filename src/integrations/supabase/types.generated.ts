// src/integrations/supabase/types.generated.ts

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string;
          name: string;
          phone: string;
          loyalty_points: number;
          visit_count: number;
          first_visit: string;
          last_visit: string;
        };
        Insert: Omit<Database['public']['Tables']['customers']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['customers']['Row']>;
      };

      orders: {
        Row: {
          id: string;
          order_number: string;
          customer_id: string;
          staff_id: string;
          total_amount: number;
          status: string;
          order_type: string;
          table_number: string;
          kot_printed: boolean;
          bill_printed: boolean;
          notes: string;
          created_at: string;
          updated_at: string;
          completed_at: string;
        };
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['orders']['Row']>;
      };

      order_items: {
        Row: {
          id: string;
          order_id: string;
          item_id: string;
          quantity: number;
          price: number;
        };
        Insert: Omit<Database['public']['Tables']['order_items']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['order_items']['Row']>;
      };

      menu_items: {
        Row: {
          id: string;
          name: string;
          category: string;
          price: number;
        };
        Insert: Omit<Database['public']['Tables']['menu_items']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['menu_items']['Row']>;
      };

      staff: {
        Row: {
          id: string;
          name: string;
        };
        Insert: Omit<Database['public']['Tables']['staff']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['staff']['Row']>;
      };
    };

    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}
