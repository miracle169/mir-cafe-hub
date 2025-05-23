
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { CartItem } from './CartContext';
import { Customer } from './CustomerContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

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
  discountAmount?: number;
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
    staffName?: string,
    discount?: number
  ) => Promise<Order>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  completeOrder: (
    orderId: string, 
    paymentDetails: {
      method: PaymentMethod;
      cash?: number;
      upi?: number;
      total: number;
    }
  ) => Promise<boolean>;
  cancelOrder: (id: string) => Promise<void>;
  getOrderById: (id: string) => Order | undefined;
  getCurrentOrders: () => Order[];
  getDailyOrders: (date: string) => Order[];
  setKotPrinted: (id: string) => Promise<void>;
  setBillPrinted: (id: string) => Promise<void>;
  updateOrderNotes: (id: string, notes: string) => Promise<void>;
  syncOrders: () => Promise<void>;
}

// Create the context
const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Provider component
export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  // Load from Supabase on mount and when user changes
  useEffect(() => {
    if (currentUser) {
      syncOrders();
    }
  }, [currentUser]);

  // Sync orders from Supabase
  const syncOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id, 
          order_number, 
          customer_id, 
          staff_id, 
          total_amount, 
          discount_amount,
          status, 
          order_type, 
          table_number, 
          payment_method, 
          cash_amount, 
          upi_amount, 
          notes, 
          kot_printed, 
          bill_printed, 
          created_at, 
          updated_at, 
          completed_at
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      const formattedOrders = await Promise.all(data.map(async (order) => {
        // Fetch order items with menu item details
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select(`
            id,
            menu_item_id,
            quantity,
            price,
            order_id,
            menu_items(id, name, category_id)
          `)
          .eq('order_id', order.id);
          
        if (itemsError) throw itemsError;
        
        let customer = null;
        if (order.customer_id) {
          const { data: customerData, error: customerError } = await supabase
            .from('customers')
            .select('*')
            .eq('id', order.customer_id)
            .single();
            
          if (!customerError && customerData) {
            customer = {
              id: customerData.id,
              name: customerData.name,
              phone: customerData.phone,
              loyaltyPoints: customerData.loyalty_points,
              visitCount: customerData.visit_count,
              lastVisit: customerData.last_visit,
              favoriteItems: [],
            };
          }
        }
        
        const { data: staffData, error: staffError } = await supabase
          .from('staff')
          .select('name')
          .eq('id', order.staff_id)
          .single();
          
        if (staffError && staffError.code !== 'PGRST116') throw staffError;
        
        // Map order items to CartItem format
        const items = itemsData.map(item => ({
          id: item.menu_item_id,
          name: item.menu_items ? (item.menu_items as any).name : 'Unknown Item',
          price: item.price,
          quantity: item.quantity,
          category: '',
        }));
        
        const paymentDetails = order.payment_method ? {
          method: order.payment_method as PaymentMethod,
          cash: order.cash_amount,
          upi: order.upi_amount,
          total: order.total_amount,
        } : undefined;
        
        return {
          id: order.id,
          items,
          customer,
          status: order.status as OrderStatus,
          type: order.order_type as OrderType,
          tableNumber: order.table_number,
          createdAt: order.created_at,
          updatedAt: order.updated_at,
          completedAt: order.completed_at,
          staffId: order.staff_id,
          staffName: staffData?.name || 'Unknown Staff',
          totalAmount: order.total_amount,
          discountAmount: order.discount_amount,
          paymentDetails,
          kotPrinted: order.kot_printed,
          billPrinted: order.bill_printed,
          notes: order.notes,
        };
      }));
      
      setOrders(formattedOrders);
    } catch (error) {
      console.error('Error syncing orders:', error);
      toast({
        title: 'Sync Error',
        description: 'Failed to sync orders from the database',
        variant: 'destructive',
      });
    }
  };

  // Create a new order
  const createOrder = async (
    items: CartItem[],
    customer: Customer | null,
    orderType: OrderType,
    tableNumber?: string,
    staffId?: string,
    staffName?: string,
    discount?: number
  ): Promise<Order> => {
    const now = new Date().toISOString();
    const totalBeforeDiscount = items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    
    const finalDiscount = discount || 0;
    const totalAmount = Math.max(0, totalBeforeDiscount - finalDiscount);
    
    const orderNumber = 'ORD' + Date.now().toString().slice(-6);
    
    try {
      const newOrderId = crypto.randomUUID();
      const actualStaffId = staffId || (currentUser ? currentUser.id : '12345');
      const actualStaffName = staffName || (currentUser ? currentUser.name : 'Demo Staff');
      
      // Insert the new order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          id: newOrderId,
          order_number: orderNumber,
          customer_id: customer?.id,
          staff_id: actualStaffId,
          total_amount: totalAmount,
          discount_amount: finalDiscount,
          status: 'pending',
          order_type: orderType,
          table_number: tableNumber || null,
          kot_printed: false,
          bill_printed: false,
        })
        .select()
        .single();
        
      if (orderError) throw orderError;
      
      // Create order items
      const orderItems = items.map(item => ({
        order_id: newOrderId,
        menu_item_id: item.id,
        quantity: item.quantity,
        price: item.price,
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
        
      if (itemsError) throw itemsError;
      
      // Update customer information if available
      if (customer) {
        const { error: customerError } = await supabase
          .from('customers')
          .update({
            visit_count: customer.visitCount + 1,
            loyalty_points: customer.loyaltyPoints + Math.floor(totalAmount / 10),
            last_visit: now,
          })
          .eq('id', customer.id);
          
        if (customerError) throw customerError;
      }
      
      // Create the complete order object to return
      const newOrder: Order = {
        id: newOrderId,
        items,
        customer,
        status: 'pending',
        type: orderType,
        tableNumber: tableNumber || undefined,
        createdAt: now,
        updatedAt: now,
        staffId: actualStaffId,
        staffName: actualStaffName,
        totalAmount,
        discountAmount: finalDiscount,
        kotPrinted: false,
        billPrinted: false,
      };
      
      setOrders((prevOrders) => [newOrder, ...prevOrders]);
      
      return newOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: 'Error',
        description: 'Failed to create order: ' + (error.message || 'Unknown error'),
        variant: 'destructive',
        duration: 3000,
      });
      throw error;
    }
  };

  // Update order status
  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
        
      if (error) throw error;
      
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === id
            ? { ...order, status, updatedAt: new Date().toISOString() }
            : order
        )
      );
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    }
  };

  // Complete an order with payment
  const completeOrder = async (
    orderId: string, 
    paymentDetails: {
      method: PaymentMethod;
      cash?: number;
      upi?: number;
      total: number;
    }
  ) => {
    const now = new Date().toISOString();
    
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'completed',
          updated_at: now,
          completed_at: now,
          payment_method: paymentDetails.method,
          cash_amount: paymentDetails.cash,
          upi_amount: paymentDetails.upi,
        })
        .eq('id', orderId);
        
      if (error) throw error;
      
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

      const completedOrder = orders.find(order => order.id === orderId);
      
      if (completedOrder && completedOrder.customer?.phone) {
        try {
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
    } catch (error) {
      console.error('Error completing order:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete order',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Cancel an order
  const cancelOrder = async (id: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
        
      if (error) throw error;
      
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
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel order',
        variant: 'destructive',
      });
    }
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
  const setKotPrinted = async (id: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ kot_printed: true })
        .eq('id', id);
        
      if (error) throw error;
      
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === id ? { ...order, kotPrinted: true } : order
        )
      );
    } catch (error) {
      console.error('Error updating KOT status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update KOT status',
        variant: 'destructive',
      });
    }
  };

  // Set bill as printed
  const setBillPrinted = async (id: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ bill_printed: true })
        .eq('id', id);
        
      if (error) throw error;
      
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === id ? { ...order, billPrinted: true } : order
        )
      );
    } catch (error) {
      console.error('Error updating bill status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update bill status',
        variant: 'destructive',
      });
    }
  };

  // Update order notes
  const updateOrderNotes = async (id: string, notes: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ notes })
        .eq('id', id);
        
      if (error) throw error;
      
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === id ? { ...order, notes } : order
        )
      );
    } catch (error) {
      console.error('Error updating order notes:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order notes',
        variant: 'destructive',
      });
    }
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
    syncOrders,
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
