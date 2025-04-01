
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash, Plus, Minus, UserPlus } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Customer, useCustomer } from '@/contexts/CustomerContext';

const CartPage = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, clearCart, totalAmount } = useCart();
  const { toast } = useToast();
  const { findCustomerByPhone, addCustomer, currentCustomer, setCurrentCustomer } = useCustomer();
  
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway' | 'delivery'>('dine-in');
  const [tableNumber, setTableNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [searchPhone, setSearchPhone] = useState('');

  const handleSearchCustomer = () => {
    if (!searchPhone || searchPhone.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive",
      });
      return;
    }

    const customer = findCustomerByPhone(searchPhone);
    if (customer) {
      setCurrentCustomer(customer);
      setCustomerName(customer.name);
      setCustomerPhone(customer.phone);
      toast({
        title: "Customer Found",
        description: `Welcome back, ${customer.name}!`,
      });
    } else {
      setCurrentCustomer(null);
      setCustomerName('');
      toast({
        title: "New Customer",
        description: "Please enter customer details",
      });
    }
  };

  const handleSaveCustomer = () => {
    if (!customerName || !customerPhone || customerPhone.length < 10) {
      toast({
        title: "Invalid Details",
        description: "Please enter a valid name and 10-digit phone number",
        variant: "destructive",
      });
      return;
    }

    let customer = findCustomerByPhone(customerPhone);
    
    if (!customer) {
      customer = addCustomer({ name: customerName, phone: customerPhone });
      toast({
        title: "Customer Added",
        description: `${customerName} has been added successfully`,
      });
    }
    
    setCurrentCustomer(customer);
  };

  const handleContinueToOrder = () => {
    if (orderType === 'dine-in' && !tableNumber) {
      toast({
        title: "Table Required",
        description: "Please enter a table number for dine-in orders",
        variant: "destructive",
      });
      return;
    }

    // Ready to create order, navigate to order details
    navigate('/pos/order', { 
      state: { 
        orderType, 
        tableNumber: orderType === 'dine-in' ? tableNumber : undefined
      } 
    });
  };

  const isEmpty = items.length === 0;

  return (
    <Layout title="Your Cart" showBackButton>
      <div className="mir-container pb-20">
        {isEmpty ? (
          <div className="text-center py-8">
            <h3 className="text-xl font-bold text-mir-black mb-2">Your cart is empty</h3>
            <p className="text-mir-gray-dark mb-4">Add some items to get started</p>
            <Button 
              className="bg-mir-red text-white"
              onClick={() => navigate('/pos')}
            >
              Back to Menu
            </Button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <Card key={item.id} className="bg-white shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-mir-black">{item.name}</h3>
                        <p className="text-sm text-mir-gray-dark">₹{item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 w-8 rounded-full p-0"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        
                        <span className="text-mir-black font-medium">{item.quantity}</span>
                        
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 w-8 rounded-full p-0"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 rounded-full p-0 text-red-500 hover:text-red-700"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-end mt-2">
                      <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Add Customer */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-mir-black">Customer Details</h3>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex items-center text-mir-red border-mir-red"
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      {currentCustomer ? 'Change' : 'Add'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Customer Details</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                      <div className="space-y-2">
                        <Label htmlFor="search-phone">Search by Phone Number</Label>
                        <div className="flex space-x-2">
                          <Input 
                            id="search-phone" 
                            value={searchPhone} 
                            onChange={e => setSearchPhone(e.target.value)}
                            placeholder="10-digit number"
                          />
                          <Button onClick={handleSearchCustomer}>Search</Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="customer-name">Name</Label>
                        <Input 
                          id="customer-name" 
                          value={customerName} 
                          onChange={e => setCustomerName(e.target.value)}
                          placeholder="Customer name"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="customer-phone">Phone</Label>
                        <Input 
                          id="customer-phone" 
                          value={customerPhone || searchPhone} 
                          onChange={e => setCustomerPhone(e.target.value)}
                          placeholder="WhatsApp number"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleSaveCustomer}>Save Customer</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              {currentCustomer ? (
                <div>
                  <p className="text-mir-black">{currentCustomer.name}</p>
                  <div className="flex items-center">
                    <p className="text-mir-gray-dark text-sm">{currentCustomer.phone}</p>
                    <Badge variant="outline" className="ml-2 bg-mir-yellow text-mir-black">
                      {currentCustomer.loyaltyPoints} points
                    </Badge>
                  </div>
                </div>
              ) : (
                <p className="text-mir-gray-dark text-sm italic">No customer selected</p>
              )}
            </div>

            {/* Order Type Selection */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
              <h3 className="font-bold text-mir-black mb-2">Order Type</h3>
              <RadioGroup 
                value={orderType} 
                onValueChange={(value) => setOrderType(value as any)}
                className="flex space-x-2"
              >
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="dine-in" id="dine-in" />
                  <Label htmlFor="dine-in">Dine-in</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="takeaway" id="takeaway" />
                  <Label htmlFor="takeaway">Takeaway</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="delivery" id="delivery" />
                  <Label htmlFor="delivery">Delivery</Label>
                </div>
              </RadioGroup>
              
              {orderType === 'dine-in' && (
                <div className="mt-3">
                  <Label htmlFor="table-number">Table Number</Label>
                  <Input 
                    id="table-number" 
                    value={tableNumber} 
                    onChange={e => setTableNumber(e.target.value)}
                    placeholder="Enter table number"
                    className="mt-1"
                  />
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
              <h3 className="font-bold text-mir-black mb-2">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-mir-gray-dark">Items</span>
                  <span>{items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-mir-gray-dark">Total Quantity</span>
                  <span>{items.reduce((acc, item) => acc + item.quantity, 0)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Action Buttons */}
      {!isEmpty && (
        <div className="fixed bottom-16 left-0 right-0 bg-white shadow-lg border-t border-mir-gray p-4 flex space-x-3">
          <Button 
            variant="outline" 
            className="flex-1 border-mir-red text-mir-red hover:bg-mir-red/10"
            onClick={() => {
              clearCart();
              toast({
                title: "Cart Cleared",
                description: "All items have been removed",
              });
              navigate('/pos');
            }}
          >
            Clear Cart
          </Button>
          <Button 
            className="flex-1 bg-mir-red text-white"
            onClick={handleContinueToOrder}
          >
            Continue
          </Button>
        </div>
      )}
    </Layout>
  );
};

export default CartPage;
