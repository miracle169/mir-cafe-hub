
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '@/contexts/CartContext';
import { useOrder, OrderType, PaymentMethod } from '@/contexts/OrderContext';
import { useCustomer } from '@/contexts/CustomerContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Printer, QrCode, CreditCard, Clock, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const OrderPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, totalAmount, clearCart } = useCart();
  const { createOrder, setKotPrinted, setBillPrinted } = useOrder();
  const { currentCustomer, addLoyaltyPoints } = useCustomer();
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const state = location.state as { orderType: OrderType; tableNumber?: string };
  const orderType = state?.orderType || 'takeaway';
  const tableNumber = state?.tableNumber || '';

  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashAmount, setCashAmount] = useState<string>(totalAmount.toString());
  const [upiAmount, setUpiAmount] = useState<string>('0');
  const [showUpiQr, setShowUpiQr] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<any>(null);

  const handlePrintKot = () => {
    if (!currentOrder) {
      toast({
        title: "Error",
        description: "Order not created yet",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "KOT Printed",
      description: `Order #${currentOrder.id.slice(0, 5)} sent to kitchen`,
    });

    setKotPrinted(currentOrder.id);
    
    // After printing KOT, redirect to POS page and clear cart
    clearCart();
    navigate('/pos');
  };

  const handlePrintBill = () => {
    if (!currentOrder) {
      toast({
        title: "Error",
        description: "Order not created yet",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Bill Printed",
      description: `Bill for Order #${currentOrder.id.slice(0, 5)} printed`,
    });

    setBillPrinted(currentOrder.id);
  };

  useEffect(() => {
    if (!currentUser || items.length === 0) {
      navigate('/pos');
      return;
    }

    const order = createOrder(
      items,
      currentCustomer,
      orderType,
      tableNumber,
      currentUser.id,
      currentUser.name
    );

    setCurrentOrder(order);
  }, []);

  const handleCompletePayment = () => {
    if (!currentOrder) return;

    const cashPayment = parseFloat(cashAmount) || 0;
    const upiPayment = parseFloat(upiAmount) || 0;
    const total = cashPayment + upiPayment;

    if (total < totalAmount) {
      toast({
        title: "Payment Error",
        description: "The total payment amount is less than the bill amount",
        variant: "destructive",
      });
      return;
    }

    const paymentDetails = {
      method: paymentMethod,
      cash: paymentMethod === 'cash' || paymentMethod === 'split' ? cashPayment : 0,
      upi: paymentMethod === 'upi' || paymentMethod === 'split' ? upiPayment : 0,
      total: totalAmount,
    };

    try {
      if (currentCustomer) {
        const loyaltyPoints = Math.floor(totalAmount / 10);
        addLoyaltyPoints(currentCustomer.id, loyaltyPoints);
      }

      setPaymentDialogOpen(false);
      setOrderCompleted(true);

      toast({
        title: "Order Completed",
        description: "Payment processed successfully",
      });

      // Clear cart immediately after payment is processed
      clearCart();
      
      // Redirect to POS page after a short delay
      setTimeout(() => {
        navigate('/pos');
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete the order",
        variant: "destructive",
      });
    }
  };

  const handleShowUpiQr = () => {
    setShowUpiQr(true);
    toast({
      title: "UPI QR Code",
      description: "Show this QR code to the customer for payment",
    });
  };

  return (
    <Layout title="Order Details" showBackButton>
      <div className="mir-container pb-20">
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex justify-between mb-3">
              <span className="text-sm text-mir-gray-dark">Order Type</span>
              <span className="font-medium">{orderType}</span>
            </div>
            
            {orderType === 'dine-in' && (
              <div className="flex justify-between mb-3">
                <span className="text-sm text-mir-gray-dark">Table Number</span>
                <span className="font-medium">{tableNumber}</span>
              </div>
            )}
            
            <div className="flex justify-between mb-3">
              <span className="text-sm text-mir-gray-dark">Items</span>
              <span className="font-medium">{items.length}</span>
            </div>
            
            <div className="flex justify-between mb-3">
              <span className="text-sm text-mir-gray-dark">Customer</span>
              <span className="font-medium">{currentCustomer?.name || 'Guest'}</span>
            </div>
            
            <div className="flex justify-between font-bold">
              <span>Total Amount</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-2 mb-6">
          <h3 className="font-bold text-lg text-mir-black">Order Items</h3>
          
          {items.map((item) => (
            <div key={item.id} className="bg-white p-3 rounded-md shadow-sm">
              <div className="flex justify-between">
                <div className="flex items-start">
                  <span className="bg-mir-yellow text-mir-black text-xs font-medium rounded px-1.5 py-0.5 mr-2">
                    {item.quantity}x
                  </span>
                  <div>
                    <p className="font-medium text-mir-black">{item.name}</p>
                    <p className="text-xs text-mir-gray-dark">₹{item.price.toFixed(2)}</p>
                  </div>
                </div>
                <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        {!orderCompleted ? (
          <div className="space-y-3">
            <Button 
              className="w-full flex items-center justify-center bg-mir-yellow text-mir-black hover:bg-mir-yellow/90"
              onClick={handlePrintKot}
            >
              <Printer className="mr-2 h-4 w-4" />
              Print KOT
            </Button>
            
            <Button 
              className="w-full flex items-center justify-center bg-mir-red text-white hover:bg-mir-red/90"
              onClick={() => setPaymentDialogOpen(true)}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Process Payment
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-green-50 border border-green-200 rounded-md p-4 text-center">
              <Check className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <h3 className="font-bold text-green-700">Order Completed</h3>
              <p className="text-green-600 text-sm">The order has been processed successfully</p>
            </div>
            
            <Button 
              className="w-full flex items-center justify-center bg-mir-red text-white hover:bg-mir-red/90"
              onClick={handlePrintBill}
            >
              <Printer className="mr-2 h-4 w-4" />
              Print Bill
            </Button>
            
            <Button 
              variant="outline"
              className="w-full flex items-center justify-center"
              onClick={() => navigate('/pos')}
            >
              <Clock className="mr-2 h-4 w-4" />
              New Order
            </Button>
          </div>
        )}
      </div>

      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogTitle>Process Payment</DialogTitle>
          <DialogDescription>Select payment method and enter details</DialogDescription>
          
          <div className="space-y-4 py-2">
            <RadioGroup 
              value={paymentMethod} 
              onValueChange={(value) => {
                setPaymentMethod(value as PaymentMethod);
                if (value === 'cash') {
                  setCashAmount(totalAmount.toString());
                  setUpiAmount('0');
                } else if (value === 'upi') {
                  setCashAmount('0');
                  setUpiAmount(totalAmount.toString());
                }
              }}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash">Cash</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="upi" id="upi" />
                <Label htmlFor="upi">UPI</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="split" id="split" />
                <Label htmlFor="split">Split Payment</Label>
              </div>
            </RadioGroup>
            
            {(paymentMethod === 'cash' || paymentMethod === 'split') && (
              <div className="space-y-2">
                <Label htmlFor="cash-amount">Cash Amount (₹)</Label>
                <Input 
                  id="cash-amount" 
                  type="number" 
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                />
              </div>
            )}
            
            {(paymentMethod === 'upi' || paymentMethod === 'split') && (
              <div className="space-y-2">
                <Label htmlFor="upi-amount">UPI Amount (₹)</Label>
                <Input 
                  id="upi-amount" 
                  type="number" 
                  value={upiAmount}
                  onChange={(e) => setUpiAmount(e.target.value)}
                />
                
                <Button 
                  variant="outline" 
                  className="w-full mt-2"
                  onClick={handleShowUpiQr}
                >
                  <QrCode className="mr-2 h-4 w-4" />
                  Show UPI QR Code
                </Button>
              </div>
            )}
            
            {showUpiQr && (paymentMethod === 'upi' || paymentMethod === 'split') && (
              <div className="bg-white p-4 border rounded-md flex justify-center">
                <div className="bg-mir-black p-4 rounded-md inline-block">
                  <QrCode className="h-32 w-32 text-white" />
                </div>
              </div>
            )}
            
            <div className="pt-2">
              <div className="flex justify-between font-bold">
                <span>Total Bill</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
              {paymentMethod === 'split' && (
                <div className="flex justify-between mt-1">
                  <span>Total Payment</span>
                  <span>₹{(parseFloat(cashAmount || '0') + parseFloat(upiAmount || '0')).toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setPaymentDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCompletePayment}>
              Complete Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default OrderPage;
