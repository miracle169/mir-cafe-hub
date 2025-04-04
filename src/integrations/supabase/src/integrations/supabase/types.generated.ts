// Generated types for Supabase

export type Database = {
  public: {
    Tables: {
      attendance: {
        Row: {
          created_at: string;
          date: string;
          check_in_time: string;
          staff_id: string;
          id: string;
          check_out_time: string | null;
        };
        Insert: {
          created_at?: string;
          date: string;
          check_in_time: string;
          staff_id: string;
          id?: string;
          check_out_time?: string | null;
        };
        Update: {
          created_at?: string;
          date?: string;
          check_in_time?: string;
          staff_id?: string;
          id?: string;
          check_out_time?: string | null;
        };
      };
      cash_register: {
        Row: {
          opening_amount: number;
          reason: string | null;
          closing_amount: number | null;
          id: string;
          staff_id: string;
          date: string;
          created_at: string;
        };
        Insert: {
          opening_amount: number;
          reason?: string | null;
          closing_amount?: number | null;
          id?: string;
          staff_id: string;
          date: string;
          created_at?: string;
        };
        Update: {
          opening_amount?: number;
          reason?: string | null;
          closing_amount?: number | null;
          id?: string;
          staff_id?: string;
          date?: string;
          created_at?: string;
        };
      };
      staff: {
        Row: {
          id: string;
          name: string;
          role: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          role: string;
          email: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          role?: string;
          email?: string;
          created_at?: string;
        };
      };
      inventory: {
        Row: {
          id: string;
          name: string;
          quantity: number;
          unit: string;
          low_stock_threshold: number | null;
          last_updated: string;
          category: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          quantity: number;
          unit: string;
          low_stock_threshold?: number | null;
          last_updated?: string;
          category: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          quantity?: number;
          unit?: string;
          low_stock_threshold?: number | null;
          last_updated?: string;
          category?: string;
          created_at?: string;
        };
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
        Insert: {
          id?: string;
          staff_id: string;
          date: string;
          total_amount: number;
          money_received: number;
          balance: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          staff_id?: string;
          date?: string;
          total_amount?: number;
          money_received?: number;
          balance?: number;
          created_at?: string;
        };
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
        Insert: {
          id?: string;
          purchase_id: string;
          item_id: string;
          quantity: number;
          unit_price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          purchase_id?: string;
          item_id?: string;
          quantity?: number;
          unit_price?: number;
          created_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          name: string;
          phone: string | null;
          email: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone?: string | null;
          email?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string | null;
          email?: string | null;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          customer_id: string | null;
          staff_id: string;
          total_amount: number;
          status: string;
          created_at: string;
          payment_method: string;
        };
        Insert: {
          id?: string;
          customer_id?: string | null;
          staff_id: string;
          total_amount: number;
          status: string;
          created_at?: string;
          payment_method: string;
        };
        Update: {
          id?: string;
          customer_id?: string | null;
          staff_id?: string;
          total_amount?: number;
          status?: string;
          created_at?: string;
          payment_method?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          quantity?: number;
          unit_price?: number;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          price: number;
          category: string;
          created_at: string;
          active: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          price: number;
          category: string;
          created_at?: string;
          active?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          price?: number;
          category?: string;
          created_at?: string;
          active?: boolean;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};
