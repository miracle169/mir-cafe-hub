import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useCart } from '@/contexts/CartContext';
import { useCustomer } from '@/contexts/CustomerContext';
import { useOrder } from '@/contexts/OrderContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Printer } from 'lucide-react';
import { printKOT, printBill, connectPrinter, isPrinterConnected } from '@/utils/printing';
import { useToast } from '@/hooks/use-toast';
import { checkSupabaseConnection } from '@/integrations/supabase/client';

const OrderPage = () => {
  const navigate = useNavigate();
  const { cart = [], totalAmount = 0, clearCart } = useCart();
  const { currentCustomer } = useCustomer();
  const { createOrder } = useOrder();
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway' | 'delivery'>('dine-in');
  const [tableNumber, setTableNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'split'>('cash');
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [upiAmount, setUpiAmount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [printerConnected, setPrinterConnected] = useState<boolean>(isPrinterConnected());
  const [connectionStatus, setConnectionStatus] = useState<boolean>(true);
  
  // Check database connection
  useEffect(() => {
    const checkConnection = async () => {
      const isConnected = await checkSupabaseConnection();
      setConnectionStatus(isConnected);
      if (!isConnected) {
        toast({
          title: 'Database Connection Error',
          description: 'Cannot connect to the database. Some features may not work.',
          variant: 'destructive',
          duration: 3000,
        });
      }
    };
    
    checkConnection();
  }, [toast]);
  
  // Calculate discount from cart context
  const discount = totalAmount - cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Total after applying discount
  const finalTotal = totalAmount;

  // Handle connect printer button click
  const handleConnectPrinter = async () => {
    try {
      const connected = await connectPrinter();
      setPrinterConnected(connected);
      
      if (connected) {
        toast({
          title: 'Printer Connected',
          description: 'Successfully connected to printer',
          duration: 1000,
        });
      } else {
        toast({
          title: 'Connection Failed',
          description: 'Failed to connect to printer',
          variant: 'destructive',
          duration: 1000,
        });
      }
    } catch (error) {
      toast({
        title: 'Connection Error',
        description: 'Error connecting to printer',
        variant: 'destructive',
        duration: 1000,
      });
    }
  };

  // Handle place order button click
  const handlePlaceOrder = async () => {
    if (!cart || cart.length === 0) {
      toast({
        title: 'Empty Cart',
        description: 'Your cart is empty',
        variant: 'destructive',
        duration: 1000,
      });
      return;
    }

    if (orderType === 'dine-in' && !tableNumber) {
      toast({
        title: 'Table Required',
        description: 'Please enter a table number for dine-in orders',
        variant: 'destructive',
        duration: 1000,
      });
      return;
    }

    if (paymentMethod === 'split') {
      const total = cashAmount + upiAmount;
      if (Math.abs(total - finalTotal) > 0.01) {
        toast({
          title: 'Invalid Split Payment',
          description: `Total split amount (₹${total.toFixed(2)}) must equal total (₹${finalTotal.toFixed(2)})`,
          variant: 'destructive',
          duration: 1000,
        });
        return;
      }
    }

    try {
      setIsProcessing(true);
      
      if (!connectionStatus) {
        toast({
          title: 'Database Connection Error',
          description: 'Unable to connect to database. Please try again later.',
          variant: 'destructive',
          duration: 3000,
        });
        setIsProcessing(false);
        return;
      }

      let staffId = '';
      let staffName = '';
      
      if (currentUser) {
        staffId = currentUser.id;
        staffName = currentUser.name;
      } else {
        // Fallback to demo values if no user is logged in
        staffId = '12345';
        staffName = 'Demo Staff';
        toast({
          title: 'Using Demo Mode',
          description: 'No staff logged in. Using demo credentials.',
          duration: 2000,
        });
      }

      // Create the order
      const order = await createOrder(
        cart,
        currentCustomer,
        orderType,
        orderType === 'dine-in' ? tableNumber : undefined,
        staffId,
        staffName
      );

      // Print KOT if printer is connected
      if (printerConnected) {
        try {
          await printKOT(order);
          toast({
            title: 'KOT Printed',
            description: 'Kitchen Order Ticket printed successfully',
            duration: 1000,
          });
        } catch (error) {
          console.error('Error printing KOT:', error);
          toast({
            title: 'Print Failed',
            description: 'Failed to print KOT',
            variant: 'destructive',
            duration: 1000,
          });
        }
      }

      // Clear the cart
      clearCart();

      // Show success message
      toast({
        title: 'Order Placed',
        description: 'Your order has been placed successfully',
        duration: 1000,
      });

      // Navigate to the view order page
      navigate(`/pos/view-order/${order.id}`);
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: 'Order Failed',
        description: 'Failed to place order: ' + (error.message || 'Unknown error'),
        variant: 'destructive',
        duration: 3000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // If cart is empty and not processing, redirect to POS
  useEffect(() => {
    if (!isProcessing && (!cart || cart.length === 0)) {
      navigate('/pos');
    }
  }, [cart, isProcessing, navigate]);

  if (!cart || cart.length === 0) {
    return null;
  }

  return (
    <Layout title="Checkout" showBackButton>
      <div className="p-4 max-w-xl mx-auto">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>
                    {item.quantity}x {item.name}
                  </span>
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              
              <Separator className="my-2" />
              
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
              
              {discount !== 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span>-₹{Math.abs(discount).toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>₹{finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Order Type</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              defaultValue={orderType} 
              onValueChange={(value) => setOrderType(value as 'dine-in' | 'takeaway' | 'delivery')}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dine-in" id="dine-in" />
                <Label htmlFor="dine-in">Dine-in</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="takeaway" id="takeaway" />
                <Label htmlFor="takeaway">Takeaway</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="delivery" id="delivery" />
                <Label htmlFor="delivery">Delivery</Label>
              </div>
            </RadioGroup>

            {orderType === 'dine-in' && (
              <div className="mt-4">
                <Label htmlFor="table-number">Table Number</Label>
                <Input 
                  id="table-number" 
                  placeholder="Enter table number" 
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="mt-1"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rest of the components remain the same */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea 
              placeholder="Add any special instructions or notes here..." 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'cash' | 'upi' | 'split')}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="cash">Cash</TabsTrigger>
                <TabsTrigger value="upi">UPI</TabsTrigger>
                <TabsTrigger value="split">Split</TabsTrigger>
              </TabsList>
              
              <TabsContent value="cash" className="mt-4">
                <p className="text-sm text-gray-500">Collect ₹{finalTotal.toFixed(2)} in cash from the customer.</p>
              </TabsContent>
              
              <TabsContent value="upi" className="mt-4">
                <p className="text-sm text-gray-500">Collect ₹{finalTotal.toFixed(2)} via UPI payment.</p>
              </TabsContent>
              
              <TabsContent value="split" className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="cash-amount">Cash Amount</Label>
                  <Input 
                    id="cash-amount" 
                    type="number" 
                    placeholder="Enter cash amount" 
                    value={cashAmount || ''}
                    onChange={(e) => setCashAmount(parseFloat(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="upi-amount">UPI Amount</Label>
                  <Input 
                    id="upi-amount" 
                    type="number" 
                    placeholder="Enter UPI amount" 
                    value={upiAmount || ''}
                    onChange={(e) => setUpiAmount(parseFloat(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
                
                <div className="flex justify-between font-medium">
                  <span>Total Split Amount:</span>
                  <span>₹{(cashAmount + upiAmount).toFixed(2)}</span>
                </div>
                
                {Math.abs((cashAmount + upiAmount) - finalTotal) > 0.01 && (
                  <p className="text-red-500 text-sm">
                    Total split amount must equal ₹{finalTotal.toFixed(2)}
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Printer Connection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  Printer Status: {printerConnected ? (
                    <span className="text-green-600">Connected</span>
                  ) : (
                    <span className="text-red-500">Not Connected</span>
                  )}
                </p>
                <p className="text-sm text-gray-500">Connect to a Bluetooth thermal printer to print receipts</p>
              </div>
              <Button 
                variant={printerConnected ? "outline" : "default"}
                size="sm"
                onClick={handleConnectPrinter}
              >
                <Printer className="mr-2 h-4 w-4" />
                {printerConnected ? "Reconnect" : "Connect"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Button 
            onClick={handlePlaceOrder}
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              "Processing..."
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Place Order
              </>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => navigate('/pos/cart')}
            disabled={isProcessing}
          >
            Back to Cart
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default OrderPage;
