
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
  items: CartItem[]; // Alias for cart
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  updateCart: (newCart: CartItem[]) => void;
  totalAmount: number; // Total amount calculated from cart items
  discount: number; // Discount amount
  setDiscount: (amount: number) => void;
}

// Create the context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider component
export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const { toast } = useToast();

  // Calculate total amount
  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity, 
    0
  ) - discount;

  // Add item to cart
  const addToCart = (item: CartItem) => {
    const existingItemIndex = cart.findIndex((cartItem) => cartItem.id === item.id);
    
    if (existingItemIndex !== -1) {
      // Item exists, update quantity
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += item.quantity;
      setCart(updatedCart);
    } else {
      // Item doesn't exist, add it
      setCart([...cart, item]);
    }
    
    toast({
      title: 'Item Added',
      description: `${item.name} added to cart`,
      duration: 1000,
    });
  };

  // Remove item from cart
  const removeFromCart = (itemId: string) => {
    setCart(cart.filter((item) => item.id !== itemId));
    toast({
      title: 'Item Removed',
      description: 'Item removed from cart',
      duration: 1000,
    });
  };

  // Update item quantity
  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCart(
      cart.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  // Update the cart
  const updateCart = (newCart: CartItem[]) => {
    setCart(newCart);
  };

  // Clear the cart
  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    toast({
      title: 'Cart Cleared',
      description: 'All items have been removed from the cart',
      duration: 1000,
    });
  };

  // Context value
  const value = {
    cart,
    items: cart, // Alias for compatibility
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    updateCart,
    totalAmount, // Provide the calculated total
    discount,
    setDiscount,
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
