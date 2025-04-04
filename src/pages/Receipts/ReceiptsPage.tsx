
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useOrder } from '@/contexts/OrderContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Search, Printer, Calendar, Bluetooth } from 'lucide-react';
import { formatDistanceToNow, format, isToday } from 'date-fns';
import { connectPrinter, printBill, disconnectPrinter, isPrinterConnected } from '@/utils/printing';

const ReceiptsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [showPrinterDialog, setShowPrinterDialog] = useState(false);
  const [printerConnected, setPrinterConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const { orders, syncOrders } = useOrder();
  const { toast } = useToast();

  // Sync orders when the page loads
  useEffect(() => {
    syncOrders();
    // Check if printer is already connected
    setPrinterConnected(isPrinterConnected());
  }, []);

  // Filter completed orders only
  useEffect(() => {
    const completedOrders = orders.filter(
      (order) => order.status === 'completed'
    );
    
    if (searchQuery) {
      setFilteredOrders(
        completedOrders.filter(
          (order) =>
            order.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customer?.phone?.includes(searchQuery) ||
            order.id.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredOrders(completedOrders);
    }
  }, [orders, searchQuery]);

  const handlePrintReceipt = async (orderId: string) => {
    if (!printerConnected) {
      toast({
        title: "Printer Not Connected",
        description: "Please connect to a printer first",
        duration: 1000,
      });
      setShowPrinterDialog(true);
      return;
    }

    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    toast({
      title: "Printing Receipt",
      description: "Sending to printer...",
      duration: 1000,
    });

    try {
      const success = await printBill(order);
      if (success) {
        toast({
          title: "Receipt Printed",
          description: "The receipt has been sent to the printer",
          duration: 1000,
        });
      } else {
        toast({
          title: "Print Failed",
          description: "Failed to print receipt",
          duration: 1000,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error printing receipt:', error);
      toast({
        title: "Print Error",
        description: "An error occurred while printing",
        duration: 1000,
        variant: "destructive",
      });
    }
  };

  const handleConnectPrinter = async () => {
    setConnecting(true);
    try {
      const connected = await connectPrinter();
      setPrinterConnected(connected);
      
      if (connected) {
        toast({
          title: "Printer Connected",
          description: "Successfully connected to printer",
          duration: 1000,
        });
      } else {
        toast({
          title: "Connection Failed",
          description: "Failed to connect to printer",
          duration: 1000,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error connecting to printer:', error);
      toast({
        title: "Connection Error",
        description: "An error occurred while connecting to printer",
        duration: 1000,
        variant: "destructive",
      });
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnectPrinter = () => {
    disconnectPrinter();
    setPrinterConnected(false);
    toast({
      title: "Printer Disconnected",
      description: "Printer has been disconnected",
      duration: 1000,
    });
  };

  return (
    <Layout title="Receipts" showBackButton>
      <div className="mir-container">
        <div className="mb-4 flex justify-between items-center">
          <div className="relative flex-1 mr-2">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search receipts by customer or order ID"
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            size="icon"
            className={printerConnected ? "bg-green-100" : ""}
            onClick={() => setShowPrinterDialog(true)}
          >
            <Bluetooth className={`h-4 w-4 ${printerConnected ? "text-green-600" : ""}`} />
          </Button>
        </div>

        <div className="mb-4">
          <h3 className="font-medium text-lg">Today's Receipts</h3>
          {filteredOrders.filter(order => 
            isToday(new Date(order.completedAt || order.createdAt))
          ).length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500">No receipts found for today</p>
            </div>
          ) : (
            <div className="space-y-3 mt-2">
              {filteredOrders
                .filter(order => isToday(new Date(order.completedAt || order.createdAt)))
                .map((order) => (
                  <Card key={order.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="bg-white p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-mir-black">
                              Order #{order.id.slice(0, 6)}
                            </h3>
                            <p className="text-sm text-mir-gray-dark">
                              {order.customer?.name || 'Guest'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">₹{order.totalAmount.toFixed(2)}</p>
                            <p className="text-xs text-mir-gray-dark">
                              {format(new Date(order.completedAt || order.createdAt), 'h:mm a')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-3 text-xs text-mir-gray-dark">
                          <p><span className="font-medium">Items:</span> {order.items.length}</p>
                          <p><span className="font-medium">Payment:</span> {order.paymentDetails?.method || 'N/A'}</p>
                        </div>
                        
                        <div className="mt-3 flex justify-end">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex items-center"
                            onClick={() => handlePrintReceipt(order.id)}
                          >
                            <Printer className="h-4 w-4 mr-1" /> Print
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="font-medium text-lg mb-2">Previous Receipts</h3>
          {filteredOrders.filter(order => 
            !isToday(new Date(order.completedAt || order.createdAt))
          ).length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500">No previous receipts found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders
                .filter(order => !isToday(new Date(order.completedAt || order.createdAt)))
                .map((order) => (
                  <Card key={order.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="bg-white p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-mir-black">
                              Order #{order.id.slice(0, 6)}
                            </h3>
                            <p className="text-sm text-mir-gray-dark">
                              {order.customer?.name || 'Guest'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">₹{order.totalAmount.toFixed(2)}</p>
                            <p className="text-xs text-mir-gray-dark flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDistanceToNow(new Date(order.completedAt || order.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-3 text-xs text-mir-gray-dark">
                          <p><span className="font-medium">Items:</span> {order.items.length}</p>
                          <p><span className="font-medium">Payment:</span> {order.paymentDetails?.method || 'N/A'}</p>
                        </div>
                        
                        <div className="mt-3 flex justify-end">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex items-center"
                            onClick={() => handlePrintReceipt(order.id)}
                          >
                            <Printer className="h-4 w-4 mr-1" /> Print
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={showPrinterDialog} onOpenChange={setShowPrinterDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Bluetooth Printer</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-mir-gray-dark mb-4">
              {printerConnected 
                ? "Printer is connected and ready to use." 
                : "Connect to a Bluetooth thermal printer to print receipts and KOTs."}
            </p>
            
            {printerConnected ? (
              <Button
                className="w-full"
                variant="outline"
                onClick={handleDisconnectPrinter}
              >
                Disconnect Printer
              </Button>
            ) : (
              <Button
                className="w-full"
                onClick={handleConnectPrinter}
                disabled={connecting}
              >
                {connecting ? "Connecting..." : "Connect to Printer"}
              </Button>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPrinterDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ReceiptsPage;
