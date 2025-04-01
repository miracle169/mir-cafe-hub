import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

// Item in the cart
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

// Cart context type
interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalAmount: number;
  itemCount: number;
}

// Create the context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider component
export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  // Add an item to the cart
  const addItem = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setItems((prevItems) => {
      // Check if the item is already in the cart
      const existingItemIndex = prevItems.findIndex((i) => i.id === item.id);

      if (existingItemIndex !== -1) {
        // If it exists, increment its quantity
        const newItems = [...prevItems];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + 1,
        };
        return newItems;
      } else {
        // Otherwise, add it with quantity 1
        return [...prevItems, { ...item, quantity: 1 }];
      }
    });

    // Show toast notification
    toast({
      title: "Item Added",
      description: `${item.name} added to cart`,
      duration: 2000,
    });
  }, [toast]);

  // Remove an item from the cart
  const removeItem = useCallback((id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  }, []);

  // Update an item's quantity
  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      // If quantity is 0 or negative, remove the item
      removeItem(id);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  }, [removeItem]);

  // Clear the cart
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  // Calculate total amount
  const totalAmount = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Calculate total number of items
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  // Context value
  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalAmount,
    itemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Hook for using the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
