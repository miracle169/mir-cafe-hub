
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

// Define the CartItem interface
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

// Define the CartContext interface
interface CartContextType {
  cart: CartItem[];
  updateCart: (newCart: CartItem[]) => void;
  clearCart: () => void;
}

// Create the context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider component
export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { toast } = useToast();

  // Update the cart
  const updateCart = (newCart: CartItem[]) => {
    setCart(newCart);
  };

  // Clear the cart
  const clearCart = () => {
    setCart([]);
    toast({
      title: 'Cart Cleared',
      description: 'All items have been removed from the cart',
      duration: 1000,
    });
  };

  // Context value
  const value = {
    cart,
    updateCart,
    clearCart,
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
