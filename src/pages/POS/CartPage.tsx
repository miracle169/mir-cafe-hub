
import React from 'react';
import Layout from '@/components/layout/Layout';
import { useCart } from '@/contexts/CartContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const CartPage = () => {
  const { cart, updateCart } = useCart();
  const navigate = useNavigate();
  
  // Handle increasing item quantity
  const handleIncreaseQuantity = (itemId) => {
    const updatedCart = cart.map((item) => 
      item.id === itemId 
        ? { ...item, quantity: item.quantity + 1 } 
        : item
    );
    updateCart(updatedCart);
  };
  
  // Handle decreasing item quantity
  const handleDecreaseQuantity = (itemId) => {
    const updatedCart = cart.map((item) => 
      item.id === itemId && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 } 
        : item
    ).filter((item) => item.quantity > 0);
    updateCart(updatedCart);
  };
  
  // Handle removing item from cart
  const handleRemoveItem = (itemId) => {
    const updatedCart = cart.filter((item) => item.id !== itemId);
    updateCart(updatedCart);
  };
  
  // Calculate total price
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity, 
    0
  );
  
  return (
    <Layout title="Cart" showBackButton>
      <div className="container py-6">
        {cart.length === 0 ? (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Your cart is empty</CardTitle>
              <CardDescription>Add items to your cart to proceed.</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => navigate('/pos')}>Go to Menu</Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px] md:h-[500px]">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-4">
                      <img src={`/images/menu/${item.name.toLowerCase().replace(/\s/g, '-')}.jpg`} alt={item.name} className="w-12 h-12 rounded object-cover" />
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-gray-500">₹{item.price.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="icon" onClick={() => handleDecreaseQuantity(item.id)}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span>{item.quantity}</span>
                      <Button variant="outline" size="icon" onClick={() => handleIncreaseQuantity(item.id)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => handleRemoveItem(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
            <Separator />
            <CardFooter className="flex justify-between items-center">
              <div className="text-xl font-semibold">
                Total: ₹{totalPrice.toFixed(2)}
              </div>
              <Button onClick={() => navigate('/pos/order')}>
                Proceed to Order <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default CartPage;
