
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '@/contexts/CartContext';
import { useCustomer } from '@/contexts/CustomerContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Minus, Plus, Trash2, User, ShoppingCart, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Order types
type OrderType = 'dine-in' | 'takeaway' | 'delivery';

const CartPage = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeFromCart, clearCart, totalAmount } = useCart();
  const { customers, currentCustomer, setCurrentCustomer } = useCustomer();
  
  const [orderType, setOrderType] = useState<OrderType>('takeaway');
  const [tableNumber, setTableNumber] = useState('');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  
  // Filter customers based on search
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
    customer.phone.includes(customerSearchQuery)
  );
  
  // Handle customer selection
  const handleSelectCustomer = (customer) => {
    setCurrentCustomer(customer);
    setIsCustomerDialogOpen(false);
  };
  
  // Handle checkout
  const handleCheckout = () => {
    // Table number is only required for dine-in orders
    if (orderType === 'dine-in' && !tableNumber.trim()) {
      alert('Please enter a table number for dine-in orders');
      return;
    }
    
    navigate('/pos/order', { 
      state: { 
        orderType, 
        tableNumber: tableNumber.trim() || undefined, // Make it optional
        notes: orderNotes
      } 
    });
  };

  return (
    <Layout title="Cart" showBackButton>
      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-wrap justify-between items-center gap-4">
                <h2 className="text-xl font-bold">Order Details</h2>
                <Button 
                  variant="outline" 
                  onClick={clearCart}
                  className="text-red-500"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear Cart
                </Button>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="orderType">Order Type</Label>
                    <Select 
                      value={orderType} 
                      onValueChange={(value) => setOrderType(value as OrderType)}
                    >
                      <SelectTrigger id="orderType">
                        <SelectValue placeholder="Select order type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dine-in">Dine In</SelectItem>
                        <SelectItem value="takeaway">Takeaway</SelectItem>
                        <SelectItem value="delivery">Delivery</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {orderType === 'dine-in' && (
                    <div className="flex-1">
                      <Label htmlFor="tableNumber">Table Number (Optional)</Label>
                      <Input 
                        id="tableNumber" 
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                        placeholder="Enter table number"
                      />
                    </div>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="customer">Customer</Label>
                  <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full justify-between" 
                        onClick={() => setIsCustomerDialogOpen(true)}
                      >
                        <span className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          {currentCustomer ? currentCustomer.name : 'Select Customer'}
                        </span>
                        {currentCustomer && <X className="h-4 w-4 opacity-70" onClick={(e) => {
                          e.stopPropagation();
                          setCurrentCustomer(null);
                        }} />}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Select Customer</DialogTitle>
                      </DialogHeader>
                      <div className="mt-2 space-y-4">
                        <Input
                          type="search"
                          placeholder="Search by name or phone..."
                          value={customerSearchQuery}
                          onChange={(e) => setCustomerSearchQuery(e.target.value)}
                        />
                        <div className="max-h-[300px] overflow-y-auto space-y-2">
                          {filteredCustomers.map((customer) => (
                            <div
                              key={customer.id}
                              className="p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
                              onClick={() => handleSelectCustomer(customer)}
                            >
                              <div className="flex justify-between">
                                <div>
                                  <p className="font-medium">{customer.name}</p>
                                  <p className="text-sm text-gray-500">{customer.phone}</p>
                                </div>
                                <Badge variant="outline">{customer.loyaltyPoints} points</Badge>
                              </div>
                            </div>
                          ))}
                          {filteredCustomers.length === 0 && (
                            <div className="text-center py-4 text-gray-500">
                              No customers found
                            </div>
                          )}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <div>
                  <Label htmlFor="orderNotes">Order Notes (Optional)</Label>
                  <Textarea 
                    id="orderNotes"
                    placeholder="Add special instructions for this order..."
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {items.length > 0 ? (
            <>
              <Card className="mb-6">
                <CardContent className="p-4">
                  <h2 className="text-xl font-bold mb-4">Order Items</h2>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div 
                        key={item.id} 
                        className="flex justify-between items-center p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500">₹{item.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            disabled={item.quantity === 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 ml-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mb-6">
                <CardContent className="p-4">
                  <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                  <div className="space-y-2">
                    <div className="flex justify-between text-lg">
                      <span>Total</span>
                      <span className="font-bold">₹{totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="text-center">
                <Button 
                  onClick={handleCheckout}
                  className="w-full sm:w-auto px-8 bg-mir-red hover:bg-mir-red/90"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Process Order
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-medium">Your cart is empty</h3>
              <p className="text-gray-500 mb-4">Add items to your cart to continue</p>
              <Button onClick={() => navigate('/pos')}>
                Back to Menu
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;
