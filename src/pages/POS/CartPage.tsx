
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useCart } from '@/contexts/CartContext';
import { useCustomer } from '@/contexts/CustomerContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Minus, Plus, Trash2, ChevronRight, Percent } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import CustomerSelector from '@/components/Customer/CustomerSelector';

const CartPage = () => {
  const { cart = [], updateCart, clearCart, totalAmount = 0 } = useCart();
  const { currentCustomer, setCurrentCustomer } = useCustomer();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [discountDialogOpen, setDiscountDialogOpen] = useState(false);
  const [discountType, setDiscountType] = useState<'percentage' | 'amount'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);

  // Check if cart is empty
  if (!cart || cart.length === 0) {
    return (
      <Layout title="Cart" showBackButton>
        <div className="p-4 flex flex-col items-center justify-center h-[80vh]">
          <h2 className="text-xl font-semibold mb-4">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Add some items to your cart to get started.</p>
          <Button onClick={() => navigate('/pos')}>Go to Menu</Button>
        </div>
      </Layout>
    );
  }

  // Handle quantity change
  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      // Remove the item if quantity becomes zero or negative
      updateCart(cart.filter(item => item.id !== itemId));
    } else {
      // Update quantity
      updateCart(cart.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  // Calculate total after discount
  const calculateDiscountedTotal = () => {
    return Math.max(0, totalAmount - discount);
  };

  // Apply discount
  const applyDiscount = () => {
    let calculatedDiscount = 0;
    
    if (discountType === 'percentage') {
      calculatedDiscount = totalAmount * (discountValue / 100);
    } else {
      calculatedDiscount = discountValue;
    }
    
    // Ensure discount doesn't exceed total
    setDiscount(Math.min(calculatedDiscount, totalAmount));
    setDiscountDialogOpen(false);
    
    toast({
      title: "Discount Applied",
      description: `${discountType === 'percentage' ? `${discountValue}%` : `₹${discountValue}`} discount applied to order.`,
      duration: 1000,
    });
  };

  return (
    <Layout title="Cart" showBackButton>
      <div className="p-4 max-w-xl mx-auto">
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Customer</CardTitle>
          </CardHeader>
          <CardContent>
            <CustomerSelector />
          </CardContent>
        </Card>
        
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Order Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-0">
                <div className="flex-1">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-gray-500">₹{item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    className="h-8 w-8 p-0 ml-2"
                    onClick={() => handleQuantityChange(item.id, 0)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex-col items-start">
            <div className="w-full flex justify-between py-2">
              <span>Subtotal:</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
            
            {discount > 0 && (
              <div className="w-full flex justify-between py-2 text-green-600">
                <span>Discount:</span>
                <span>-₹{discount.toFixed(2)}</span>
              </div>
            )}
            
            <div className="w-full flex justify-between py-2 font-bold text-lg border-t mt-2">
              <span>Total:</span>
              <span>₹{calculateDiscountedTotal().toFixed(2)}</span>
            </div>
            
            <div className="w-full mt-4 flex flex-col gap-2">
              <Dialog open={discountDialogOpen} onOpenChange={setDiscountDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Percent className="mr-2 h-4 w-4" />
                    {discount > 0 ? 'Update Discount' : 'Add Discount'}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Apply Discount</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="flex items-center gap-4">
                      <Button 
                        variant={discountType === 'percentage' ? 'default' : 'outline'}
                        onClick={() => setDiscountType('percentage')}
                      >
                        Percentage (%)
                      </Button>
                      <Button 
                        variant={discountType === 'amount' ? 'default' : 'outline'}
                        onClick={() => setDiscountType('amount')}
                      >
                        Amount (₹)
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discount">
                        {discountType === 'percentage' ? 'Discount Percentage' : 'Discount Amount'}
                      </Label>
                      <Input 
                        id="discount" 
                        type="number" 
                        value={discountValue}
                        onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                        min="0"
                        max={discountType === 'percentage' ? '100' : totalAmount.toString()}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={applyDiscount}>Apply Discount</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Button variant="destructive" onClick={clearCart}>
                Clear Cart
              </Button>
              
              <Button className="w-full" onClick={() => navigate('/pos/order')}>
                Proceed to Checkout
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default CartPage;
