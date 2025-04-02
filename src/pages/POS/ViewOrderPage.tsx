
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useOrder, PaymentMethod } from '@/contexts/OrderContext';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, Printer, CreditCard, QrCode, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const ViewOrderPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getOrderById, completeOrder, updateOrderStatus, setBillPrinted } = useOrder();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashAmount, setCashAmount] = useState<string>('0');
  const [upiAmount, setUpiAmount] = useState<string>('0');
  const [showUpiQr, setShowUpiQr] = useState(false);
  
  if (!id) {
    navigate('/pos');
    return null;
  }
  
  const order = getOrderById(id);
  
  if (!order) {
    navigate('/pos');
    return null;
  }
  
  const totalAmount = order.totalAmount;
  const isPending = order.status !== 'completed' && order.status !== 'cancelled';
  
  const handleUpdateStatus = (status: 'pending' | 'preparing' | 'ready') => {
    updateOrderStatus(id, status);
    toast({
      title: "Status Updated",
      description: `Order status changed to ${status}`,
    });
  };
  
  const handlePrintBill = () => {
    setBillPrinted(id);
    toast({
      title: "Bill Printed",
      description: `Bill for Order #${order.id.slice(0, 5)} printed successfully`,
    });
  };
  
  const handleShowUpiQr = () => {
    setShowUpiQr(true);
    toast({
      title: "UPI QR Code",
      description: "Show this QR code to the customer for payment",
    });
  };
  
  const handleCompletePayment = () => {
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
      completeOrder(id, paymentDetails);
      setPaymentDialogOpen(false);
      
      toast({
        title: "Order Completed",
        description: "Payment processed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete the order",
        variant: "destructive",
      });
    }
  };
  
  // Format the creation date
  const formattedDate = format(new Date(order.createdAt), 'MMM dd, yyyy hh:mm a');
  const timeElapsed = Math.floor(
    (new Date().getTime() - new Date(order.createdAt).getTime()) / (1000 * 60)
  );
  
  // Initialize payment amounts when opening the dialog
  const handleOpenPaymentDialog = () => {
    setCashAmount(totalAmount.toString());
    setUpiAmount('0');
    setPaymentDialogOpen(true);
  };
  
  return (
    <Layout title={`Order #${order.id.slice(-4)}`} showBackButton>
      <div className="mir-container pb-20">
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center">
                  <h2 className="text-xl font-bold">Order #{order.id.slice(-4)}</h2>
                  <Badge 
                    className={`ml-2 ${
                      order.status === 'completed' ? 'bg-green-500' : 
                      order.status === 'cancelled' ? 'bg-red-500' :
                      timeElapsed > 30 ? 'bg-red-500' :
                      timeElapsed > 15 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500">{formattedDate}</p>
              </div>
              
              {isPending && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">
                    {timeElapsed > 60 
                      ? `${Math.floor(timeElapsed / 60)}h ${timeElapsed % 60}m` 
                      : `${timeElapsed}m`}
                  </span>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <span className="text-sm text-gray-500">Order Type</span>
                <p className="font-medium">{order.type}</p>
              </div>
              
              {order.type === 'dine-in' && (
                <div>
                  <span className="text-sm text-gray-500">Table</span>
                  <p className="font-medium">{order.tableNumber}</p>
                </div>
              )}
              
              <div>
                <span className="text-sm text-gray-500">Staff</span>
                <p className="font-medium">{order.staffName}</p>
              </div>
              
              <div>
                <span className="text-sm text-gray-500">Customer</span>
                <p className="font-medium">{order.customer?.name || 'Guest'}</p>
              </div>
            </div>
            
            {!isPending && order.paymentDetails && (
              <div className="mb-3 bg-gray-50 p-2 rounded">
                <h3 className="font-medium mb-1">Payment Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Method:</span>
                    <span className="ml-1 capitalize">{order.paymentDetails.method}</span>
                  </div>
                  
                  {(order.paymentDetails.method === 'cash' || order.paymentDetails.method === 'split') && (
                    <div>
                      <span className="text-gray-500">Cash:</span>
                      <span className="ml-1">₹{order.paymentDetails.cash?.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {(order.paymentDetails.method === 'upi' || order.paymentDetails.method === 'split') && (
                    <div>
                      <span className="text-gray-500">UPI:</span>
                      <span className="ml-1">₹{order.paymentDetails.upi?.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div>
                    <span className="text-gray-500">Total:</span>
                    <span className="ml-1 font-medium">₹{order.paymentDetails.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="space-y-3 mb-6">
          <h3 className="font-bold text-lg">Order Items</h3>
          
          {order.items.map((item) => (
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
          
          <div className="border-t pt-3 flex justify-between font-bold">
            <span>Total</span>
            <span>₹{order.totalAmount.toFixed(2)}</span>
          </div>
        </div>
        
        {isPending ? (
          <div className="space-y-3">
            <div className="flex justify-between space-x-2">
              <Button 
                variant="outline" 
                className={`flex-1 ${order.status === 'pending' ? 'bg-gray-100' : ''}`}
                onClick={() => handleUpdateStatus('pending')}
                disabled={order.status === 'pending'}
              >
                Pending
              </Button>
              <Button 
                variant="outline" 
                className={`flex-1 ${order.status === 'preparing' ? 'bg-gray-100' : ''}`}
                onClick={() => handleUpdateStatus('preparing')}
                disabled={order.status === 'preparing'}
              >
                Preparing
              </Button>
              <Button 
                variant="outline" 
                className={`flex-1 ${order.status === 'ready' ? 'bg-gray-100' : ''}`}
                onClick={() => handleUpdateStatus('ready')}
                disabled={order.status === 'ready'}
              >
                Ready
              </Button>
            </div>
            
            <Button 
              className="w-full bg-mir-red text-white hover:bg-mir-red/90"
              onClick={handleOpenPaymentDialog}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Process Payment
            </Button>
            
            <Button 
              variant="outline"
              className="w-full"
              onClick={handlePrintBill}
            >
              <Printer className="mr-2 h-4 w-4" />
              Print Bill
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {order.status === 'completed' && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4 text-center">
                <Check className="h-6 w-6 text-green-500 mx-auto mb-2" />
                <h3 className="font-bold text-green-700">Order Completed</h3>
                <p className="text-green-600 text-sm">The order has been processed successfully</p>
              </div>
            )}
            
            {order.status === 'cancelled' && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
                <h3 className="font-bold text-red-700">Order Cancelled</h3>
              </div>
            )}
            
            <Button 
              variant="outline"
              className="w-full"
              onClick={handlePrintBill}
            >
              <Printer className="mr-2 h-4 w-4" />
              Print Bill
            </Button>
            
            <Button 
              variant="outline"
              className="w-full"
              onClick={() => navigate('/pos')}
            >
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

export default ViewOrderPage;
