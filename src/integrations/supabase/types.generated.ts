
// src/integrations/supabase/types.generated.ts

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      attendance: {
        Row: {
          id: string;
          staff_id: string;
          check_in_time: string;
          check_out_time: string | null;
          date: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['attendance']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['attendance']['Row']>;
      };
      
      cash_register: {
        Row: {
          id: string;
          staff_id: string;
          date: string;
          opening_amount: number;
          closing_amount: number | null;
          reason: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['cash_register']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['cash_register']['Row']>;
      };
      
      customer_favorite_items: {
        Row: {
          id: string;
          customer_id: string | null;
          item_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['customer_favorite_items']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['customer_favorite_items']['Row']>;
      };
      
      customers: {
        Row: {
          id: string;
          name: string;
          phone: string;
          loyalty_points: number;
          visit_count: number;
          last_visit: string | null;
          first_visit: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['customers']['Row'], 'id' | 'created_at' | 'loyalty_points' | 'visit_count' | 'first_visit'>;
        Update: Partial<Database['public']['Tables']['customers']['Row']>;
      };
      
      inventory_items: {
        Row: {
          id: string;
          name: string;
          quantity: number;
          unit: string;
          low_stock_threshold: number | null;
          category: string;
          created_at: string;
          last_updated: string;
        };
        Insert: Omit<Database['public']['Tables']['inventory_items']['Row'], 'id' | 'created_at' | 'last_updated'>;
        Update: Partial<Database['public']['Tables']['inventory_items']['Row']>;
      };
      
      menu_categories: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['menu_categories']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['menu_categories']['Row']>;
      };
      
      menu_items: {
        Row: {
          id: string;
          name: string;
          price: number;
          category_id: string | null;
          description: string | null;
          image: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['menu_items']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['menu_items']['Row']>;
      };
      
      order_items: {
        Row: {
          id: string;
          order_id: string;
          item_id: string;
          quantity: number;
          price: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['order_items']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['order_items']['Row']>;
      };
      
      orders: {
        Row: {
          id: string;
          order_number: string;
          customer_id: string | null;
          staff_id: string;
          total_amount: number;
          status: string;
          order_type: string;
          table_number: string | null;
          payment_method: string | null;
          cash_amount: number | null;
          upi_amount: number | null;
          notes: string | null;
          kot_printed: boolean | null;
          bill_printed: boolean | null;
          created_at: string;
          updated_at: string;
          completed_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['orders']['Row']>;
      };
      
      owner_config: {
        Row: {
          id: string;
          whatsapp_api_key: string | null;
          upi_qr_code_url: string | null;
        };
        Insert: Omit<Database['public']['Tables']['owner_config']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['owner_config']['Row']>;
      };
      
      purchase_items: {
        Row: {
          id: string;
          purchase_id: string;
          item_id: string;
          quantity: number;
          unit_price: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['purchase_items']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['purchase_items']['Row']>;
      };
      
      purchase_logs: {
        Row: {
          id: string;
          staff_id: string;
          date: string;
          total_amount: number;
          money_received: number;
          balance: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['purchase_logs']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['purchase_logs']['Row']>;
      };
      
      staff: {
        Row: {
          id: string;
          name: string;
          role: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['staff']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['staff']['Row']>;
      };
    };
    
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}

