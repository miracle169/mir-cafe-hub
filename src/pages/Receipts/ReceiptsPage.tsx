
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { useOrder } from '@/contexts/OrderContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { Search, FileText, Printer } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { printBill } from '@/utils/printing';

const ReceiptsPage = () => {
  const { orders, syncOrders } = useOrder();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Sync orders when the component mounts
    syncOrders();
  }, []);

  // Filter orders for the selected date
  const filteredOrders = orders.filter((order) => {
    const orderDate = new Date(order.createdAt);
    return (
      orderDate.toDateString() === selectedDate.toDateString() &&
      (searchQuery === '' ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const handlePrintReceipt = async (order) => {
    try {
      await printBill(order);
      toast({
        title: 'Receipt Printed',
        description: `Receipt for Order #${order.id.slice(0, 5)} printed successfully`,
        duration: 1000,
      });
    } catch (error) {
      toast({
        title: 'Print Failed',
        description: 'Failed to print receipt. Check printer connection.',
        variant: 'destructive',
        duration: 1000,
      });
    }
  };

  return (
    <Layout title="Receipts">
      <div className="p-4 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
          <div className="flex-1 w-full">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search orders or customers..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-2">
            <Label htmlFor="date" className="md:mr-2">Date:</Label>
            <DatePicker date={selectedDate} setDate={setSelectedDate} />
          </div>
          
          <Button 
            onClick={() => syncOrders()}
            variant="outline"
            size="sm"
          >
            Refresh
          </Button>
        </div>

        {filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-mir-gray-light p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-base">
                        Order #{order.id.slice(0, 5)}
                      </CardTitle>
                      <p className="text-sm text-mir-gray-dark">
                        {format(new Date(order.createdAt), 'MMM dd, yyyy - hh:mm a')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={order.status === 'completed' ? 'default' : 'outline'}>
                        {order.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handlePrintReceipt(order)}
                        title="Print Receipt"
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-mir-gray-dark">Customer</p>
                      <p className="font-medium">{order.customer?.name || 'Guest'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-mir-gray-dark">Staff</p>
                      <p className="font-medium">{order.staffName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-mir-gray-dark">Type</p>
                      <p className="font-medium capitalize">{order.type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-mir-gray-dark">Amount</p>
                      <p className="font-medium">₹{order.totalAmount.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-mir-gray-dark mb-2">Items</p>
                    <div className="space-y-1 text-sm">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between">
                          <span>
                            {item.quantity}x {item.name}
                          </span>
                          <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-mir-gray mx-auto mb-4" />
            <h3 className="text-lg font-medium">No receipts found</h3>
            <p className="text-mir-gray-dark">
              There are no receipts for {format(selectedDate, 'MMMM dd, yyyy')}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ReceiptsPage;
