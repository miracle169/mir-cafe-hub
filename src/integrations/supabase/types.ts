export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      attendance: {
        Row: {
          check_in_time: string
          check_out_time: string | null
          created_at: string
          date: string
          id: string
          staff_id: string
        }
        Insert: {
          check_in_time: string
          check_out_time?: string | null
          created_at?: string
          date: string
          id?: string
          staff_id: string
        }
        Update: {
          check_in_time?: string
          check_out_time?: string | null
          created_at?: string
          date?: string
          id?: string
          staff_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_register: {
        Row: {
          closing_amount: number | null
          created_at: string
          date: string
          id: string
          opening_amount: number
          reason: string | null
          staff_id: string
        }
        Insert: {
          closing_amount?: number | null
          created_at?: string
          date: string
          id?: string
          opening_amount: number
          reason?: string | null
          staff_id: string
        }
        Update: {
          closing_amount?: number | null
          created_at?: string
          date?: string
          id?: string
          opening_amount?: number
          reason?: string | null
          staff_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cash_register_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_favorite_items: {
        Row: {
          created_at: string
          customer_id: string | null
          id: string
          item_id: string | null
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          id?: string
          item_id?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          id?: string
          item_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_favorite_items_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_favorite_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string
          first_visit: string
          id: string
          last_visit: string | null
          loyalty_points: number
          name: string
          phone: string
          visit_count: number
        }
        Insert: {
          created_at?: string
          first_visit?: string
          id?: string
          last_visit?: string | null
          loyalty_points?: number
          name: string
          phone: string
          visit_count?: number
        }
        Update: {
          created_at?: string
          first_visit?: string
          id?: string
          last_visit?: string | null
          loyalty_points?: number
          name?: string
          phone?: string
          visit_count?: number
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          category: string
          created_at: string
          id: string
          last_updated: string
          low_stock_threshold: number | null
          name: string
          quantity: number
          unit: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          last_updated?: string
          low_stock_threshold?: number | null
          name: string
          quantity: number
          unit: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          last_updated?: string
          low_stock_threshold?: number | null
          name?: string
          quantity?: number
          unit?: string
        }
        Relationships: []
      }
      menu_categories: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          image: string | null
          name: string
          price: number
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          name: string
          price: number
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          name?: string
          price?: number
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          item_id: string
          order_id: string
          price: number
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          order_id: string
          price: number
          quantity: number
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          order_id?: string
          price?: number
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          bill_printed: boolean | null
          cash_amount: number | null
          completed_at: string | null
          created_at: string
          customer_id: string | null
          id: string
          kot_printed: boolean | null
          notes: string | null
          order_number: string
          order_type: string
          payment_method: string | null
          staff_id: string
          status: string
          table_number: string | null
          total_amount: number
          updated_at: string
          upi_amount: number | null
        }
        Insert: {
          bill_printed?: boolean | null
          cash_amount?: number | null
          completed_at?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          kot_printed?: boolean | null
          notes?: string | null
          order_number: string
          order_type: string
          payment_method?: string | null
          staff_id: string
          status: string
          table_number?: string | null
          total_amount: number
          updated_at?: string
          upi_amount?: number | null
        }
        Update: {
          bill_printed?: boolean | null
          cash_amount?: number | null
          completed_at?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          kot_printed?: boolean | null
          notes?: string | null
          order_number?: string
          order_type?: string
          payment_method?: string | null
          staff_id?: string
          status?: string
          table_number?: string | null
          total_amount?: number
          updated_at?: string
          upi_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      owner_config: {
        Row: {
          id: string
          upi_qr_code_url: string | null
          whatsapp_api_key: string | null
        }
        Insert: {
          id?: string
          upi_qr_code_url?: string | null
          whatsapp_api_key?: string | null
        }
        Update: {
          id?: string
          upi_qr_code_url?: string | null
          whatsapp_api_key?: string | null
        }
        Relationships: []
      }
      purchase_items: {
        Row: {
          created_at: string
          id: string
          item_id: string
          purchase_id: string
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          purchase_id: string
          quantity: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          purchase_id?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_items_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchase_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_logs: {
        Row: {
          balance: number
          created_at: string
          date: string
          id: string
          money_received: number
          staff_id: string
          total_amount: number
        }
        Insert: {
          balance: number
          created_at?: string
          date?: string
          id?: string
          money_received: number
          staff_id: string
          total_amount: number
        }
        Update: {
          balance?: number
          created_at?: string
          date?: string
          id?: string
          money_received?: number
          staff_id?: string
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_logs_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      staff: {
        Row: {
          created_at: string
          id: string
          name: string
          role: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          role: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          role?: string
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
