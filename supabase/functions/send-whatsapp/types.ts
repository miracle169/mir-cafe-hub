
// Custom types for WhatsApp integration that don't rely on read-only files

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  loyalty_points?: number;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customer_id?: string;
  customer?: Customer;
  totalAmount: number;
  items: OrderItem[];
  status: string;
  type: string;
  tableNumber?: string;
  staffName: string;
  staffId: string;
  createdAt: string;
  paymentMethod?: string;
  cashAmount?: number;
  upiAmount?: number;
}

export interface WhatsAppMessage {
  phone: string;
  message: string;
}
