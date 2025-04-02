import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { CartItem } from './CartContext';
import { Customer } from './CustomerContext';

// Order status enum
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';

// Order type enum
export type OrderType = 'dine-in' | 'takeaway' | 'delivery';

// Payment method enum
export type PaymentMethod = 'cash' | 'upi' | 'split';

// Payment details interface
export interface PaymentDetails {
  method: PaymentMethod;
  cash?: number;
  upi?: number;
  total: number;
}

// Order interface
export interface Order {
  id: string;
  items: CartItem[];
  customer: Customer | null;
  status: OrderStatus;
  type: OrderType;
  tableNumber?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  staffId: string;
  staffName: string;
  totalAmount: number;
  paymentDetails?: PaymentDetails;
  kotPrinted: boolean;
  billPrinted: boolean;
  notes?: string;
}

// Order context type
interface OrderContextType {
  orders: Order[];
  createOrder: (
    items: CartItem[],
    customer: Customer | null,
    orderType: OrderType,
    tableNumber?: string,
    staffId?: string,
    staffName?: string
  ) => Order;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  completeOrder: (
    orderId: string, 
    paymentDetails: {
      method: PaymentMethod;
      cash?: number;
      upi?: number;
      total: number;
    }
  ) => boolean;
  cancelOrder: (id: string) => void;
  getOrderById: (id: string) => Order | undefined;
  getCurrentOrders: () => Order[];
  getDailyOrders: (date: string) => Order[];
  setKotPrinted: (id: string) => void;
  setBillPrinted: (id: string) => void;
  updateOrderNotes: (id: string, notes: string) => void;
}

// Create the context
const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Provider component
export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedOrders = localStorage.getItem('mir-orders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  }, []);

  // Save to localStorage when orders change
  useEffect(() => {
    localStorage.setItem('mir-orders', JSON.stringify(orders));
  }, [orders]);

  // Create a new order
  const createOrder = (
    items: CartItem[],
    customer: Customer | null,
    orderType: OrderType,
    tableNumber?: string,
    staffId?: string,
    staffName?: string
  ): Order => {
    const now = new Date().toISOString();
    const totalAmount = items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    const newOrder: Order = {
      id: Date.now().toString(),
      items,
      customer,
      status: 'pending',
      type: orderType,
      tableNumber: orderType === 'dine-in' ? tableNumber : undefined,
      createdAt: now,
      updatedAt: now,
      staffId: staffId || 'unknown',
      staffName: staffName || 'unknown',
      totalAmount,
      kotPrinted: false,
      billPrinted: false,
    };

    setOrders((prevOrders) => [...prevOrders, newOrder]);
    return newOrder;
  };

  // Update order status
  const updateOrderStatus = (id: string, status: OrderStatus) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === id
          ? { ...order, status, updatedAt: new Date().toISOString() }
          : order
      )
    );
  };

  // Complete an order with payment
  const completeOrder = (
    orderId: string, 
    paymentDetails: {
      method: PaymentMethod;
      cash?: number;
      upi?: number;
      total: number;
    }
  ) => {
    const now = new Date().toISOString();
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: 'completed',
              updatedAt: now,
              completedAt: now,
              paymentDetails,
            }
          : order
      )
    );

    // Find the completed order
    const completedOrder = orders.find(order => order.id === orderId);
    
    // Send WhatsApp notification for order completion
    if (completedOrder && completedOrder.customer?.phone) {
      try {
        // Call the Supabase edge function
        supabase.functions.invoke('send-whatsapp', {
          body: { order: completedOrder }
        }).then(response => {
          if (response.error) {
            console.error('Error sending WhatsApp notification:', response.error);
          } else {
            console.log('WhatsApp notification sent successfully');
          }
        });
      } catch (error) {
        console.error('Failed to send WhatsApp notification:', error);
      }
    }

    return true;
  };

  // Cancel an order
  const cancelOrder = (id: string) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === id
          ? {
              ...order,
              status: 'cancelled',
              updatedAt: new Date().toISOString(),
            }
          : order
      )
    );
  };

  // Get order by ID
  const getOrderById = (id: string) => {
    return orders.find((order) => order.id === id);
  };

  // Get current active orders (not completed or cancelled)
  const getCurrentOrders = () => {
    return orders.filter(
      (order) => order.status !== 'completed' && order.status !== 'cancelled'
    );
  };

  // Get orders for a specific day
  const getDailyOrders = (date: string) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startOfDay && orderDate <= endOfDay;
    });
  };

  // Set KOT as printed
  const setKotPrinted = (id: string) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === id ? { ...order, kotPrinted: true } : order
      )
    );
  };

  // Set bill as printed
  const setBillPrinted = (id: string) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === id ? { ...order, billPrinted: true } : order
      )
    );
  };

  // Update order notes
  const updateOrderNotes = (id: string, notes: string) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === id ? { ...order, notes } : order
      )
    );
  };

  // Context value
  const value = {
    orders,
    createOrder,
    updateOrderStatus,
    completeOrder,
    cancelOrder,
    getOrderById,
    getCurrentOrders,
    getDailyOrders,
    setKotPrinted,
    setBillPrinted,
    updateOrderNotes,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};

// Hook for using the order context
export const useOrder = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};
