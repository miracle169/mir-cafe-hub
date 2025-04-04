import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useAttendance } from '@/contexts/AttendanceContext';
import { useAuth } from '@/contexts/AuthContext';
import { useOrder } from '@/contexts/OrderContext';
import { DollarSign, ArrowRight, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const CashDrawerPage = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const { cashRegisterEntries, registerOpeningCash, registerClosingCash, getTodayCashRegister } = useAttendance();
  const { orders } = useOrder();
  
  const [openingAmount, setOpeningAmount] = useState('');
  const [closingAmount, setClosingAmount] = useState('');
  const [reason, setReason] = useState('');
  const [todayCashEntry, setTodayCashEntry] = useState<any>(null);

  // Load today's cash drawer entry
  useEffect(() => {
    if (!currentUser) return;
    
    const entry = getTodayCashRegister(currentUser.id);
    setTodayCashEntry(entry);
    
    if (entry) {
      // If we already have an entry, pre-fill the form
      if (entry.openingAmount) {
        setOpeningAmount(entry.openingAmount.toString());
      }
      
      if (entry.closingAmount) {
        setClosingAmount(entry.closingAmount.toString());
      }
      
      if (entry.reason) {
        setReason(entry.reason);
      }
    }
  }, [currentUser, getTodayCashRegister, cashRegisterEntries]);

  // Calculate today's cash sales
  const calculateTodayCashSales = () => {
    if (!currentUser) return 0;
    
    const today = new Date().toISOString().split('T')[0];
    
    // Filter orders for today that were handled by the current user
    const todayOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
      return orderDate === today && 
             order.staffId === currentUser.id && 
             order.status === 'completed';
    });
    
    // Sum up the cash payments
    return todayOrders.reduce((total, order) => {
      // If payment was made in cash or split, add the cash amount
      if (order.paymentDetails) {
        if (order.paymentDetails.method === 'cash') {
          return total + order.totalAmount;
        } else if (order.paymentDetails.method === 'split' && order.paymentDetails.cash) {
          return total + order.paymentDetails.cash;
        }
      }
      return total;
    }, 0);
  };

  // Handle opening cash registration
  const handleRegisterOpeningCash = () => {
    if (!currentUser) return;
    
    if (!openingAmount || parseFloat(openingAmount) < 0) {
      toast({
        title: "Error",
        description: "Please enter a valid opening amount",
        variant: "destructive",
        duration: 1000,
      });
      return;
    }
    
    try {
      registerOpeningCash(
        currentUser.id,
        currentUser.name,
        parseFloat(openingAmount),
        reason
      );
      
      toast({
        title: "Success",
        description: "Opening cash registered successfully",
        duration: 1000,
      });
      
      // Update the local state
      const entry = getTodayCashRegister(currentUser.id);
      setTodayCashEntry(entry);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to register opening cash",
        variant: "destructive",
        duration: 1000,
      });
    }
  };

  // Handle closing cash registration
  const handleRegisterClosingCash = () => {
    if (!currentUser || !todayCashEntry) return;
    
    if (!closingAmount || parseFloat(closingAmount) < 0) {
      toast({
        title: "Error",
        description: "Please enter a valid closing amount",
        variant: "destructive",
        duration: 1000,
      });
      return;
    }
    
    try {
      registerClosingCash(
        currentUser.id,
        parseFloat(closingAmount)
      );
      
      toast({
        title: "Success",
        description: "Closing cash registered successfully",
        duration: 1000,
      });
      
      // Update the local state
      const entry = getTodayCashRegister(currentUser.id);
      setTodayCashEntry(entry);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to register closing cash",
        variant: "destructive",
        duration: 1000,
      });
    }
  };

  // Expected closing amount = Opening + Cash Sales
  const cashSales = calculateTodayCashSales();
  const expectedClosing = todayCashEntry 
    ? todayCashEntry.openingAmount + cashSales 
    : parseFloat(openingAmount || '0') + cashSales;

  // Difference = Actual Closing - Expected Closing
  const actualClosing = todayCashEntry?.closingAmount || parseFloat(closingAmount || '0');
  const difference = actualClosing - expectedClosing;

  return (
    <Layout title="Cash Drawer" showBackButton>
      <div className="mir-container">
        <Card className="bg-white shadow-sm mb-4">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-mir-black">Today's Cash Drawer</h2>
              <Badge variant="outline" className="bg-mir-yellow/20 text-mir-black border-mir-yellow">
                <Clock className="h-3 w-3 mr-1" />
                {new Date().toLocaleDateString()}
              </Badge>
            </div>
            
            {!todayCashEntry || todayCashEntry.openingAmount === undefined ? (
              <div className="space-y-4">
                <p className="text-mir-gray-dark mb-4">Register opening cash amount for today</p>
                
                <div className="space-y-2">
                  <Label htmlFor="opening-amount">Opening Amount (₹)</Label>
                  <Input 
                    id="opening-amount" 
                    type="number" 
                    value={openingAmount} 
                    onChange={(e) => setOpeningAmount(e.target.value)}
                    placeholder="Enter opening cash amount"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason (Optional)</Label>
                  <Textarea 
                    id="reason" 
                    value={reason} 
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Explain if opening amount is different from last day's closing"
                    rows={3}
                  />
                </div>
                
                <Button 
                  className="w-full bg-mir-red text-white"
                  onClick={handleRegisterOpeningCash}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Register Opening Cash
                </Button>
              </div>
            ) : !todayCashEntry.closingAmount ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-mir-gray-dark">Opening Amount</span>
                    <span className="font-medium">₹{todayCashEntry.openingAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-mir-gray-dark">Cash Sales Today</span>
                    <span className="font-medium">₹{cashSales.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-3 pt-2 border-t">
                    <span className="font-bold">Expected Closing</span>
                    <span className="font-bold">₹{expectedClosing.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="space-y-2 pt-2">
                  <Label htmlFor="closing-amount">Actual Closing Amount (₹)</Label>
                  <Input 
                    id="closing-amount" 
                    type="number" 
                    value={closingAmount} 
                    onChange={(e) => setClosingAmount(e.target.value)}
                    placeholder="Enter actual cash in drawer"
                  />
                  
                  {closingAmount && parseFloat(closingAmount) !== 0 && (
                    <div className="flex justify-between items-center mt-2">
                      <span className={difference < 0 ? "text-red-500 font-medium" : difference > 0 ? "text-green-600 font-medium" : "text-gray-500"}>
                        {difference < 0 ? "Shortage" : difference > 0 ? "Excess" : "Balanced"}
                      </span>
                      <span className={difference < 0 ? "text-red-500 font-medium" : difference > 0 ? "text-green-600 font-medium" : "text-gray-500"}>
                        ₹{Math.abs(difference).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
                
                <Button 
                  className="w-full bg-mir-red text-white"
                  onClick={handleRegisterClosingCash}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Register Closing Cash
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-mir-yellow/10 p-3 rounded-md">
                    <h3 className="text-sm text-mir-gray-dark">Opening Cash</h3>
                    <p className="text-xl font-bold">₹{todayCashEntry.openingAmount.toFixed(2)}</p>
                  </div>
                  <div className="bg-mir-yellow/10 p-3 rounded-md">
                    <h3 className="text-sm text-mir-gray-dark">Cash Sales</h3>
                    <p className="text-xl font-bold">₹{cashSales.toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="bg-mir-red/10 p-3 rounded-md mb-2">
                  <h3 className="text-sm text-mir-gray-dark">Expected Closing</h3>
                  <p className="text-xl font-bold">₹{expectedClosing.toFixed(2)}</p>
                </div>
                
                <div className="bg-green-50 p-3 rounded-md">
                  <h3 className="text-sm text-mir-gray-dark">Actual Closing</h3>
                  <p className="text-xl font-bold">₹{todayCashEntry.closingAmount.toFixed(2)}</p>
                </div>
                
                {todayCashEntry.closingAmount !== expectedClosing && (
                  <div className={`p-3 rounded-md ${difference < 0 ? "bg-red-50" : "bg-green-50"}`}>
                    <h3 className="text-sm text-mir-gray-dark">
                      {difference < 0 ? "Shortage" : "Excess"}
                    </h3>
                    <p className={`text-xl font-bold ${difference < 0 ? "text-red-500" : "text-green-600"}`}>
                      ₹{Math.abs(difference).toFixed(2)}
                    </p>
                  </div>
                )}
                
                <div className="text-center mt-4">
                  <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                    Cash drawer closed for today
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {todayCashEntry?.reason && (
          <Card className="bg-white shadow-sm">
            <CardContent className="p-4">
              <h3 className="font-medium text-mir-black mb-2">Opening Cash Notes</h3>
              <p className="text-mir-gray-dark text-sm">{todayCashEntry.reason}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default CashDrawerPage;
