
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOrder, Order } from '@/contexts/OrderContext';
import { Clock, Receipt, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// Function to format time elapsed
const formatTimeElapsed = (createdAt: string): string => {
  const orderTime = new Date(createdAt).getTime();
  const currentTime = new Date().getTime();
  const elapsedMs = currentTime - orderTime;
  
  const minutes = Math.floor(elapsedMs / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  return `${minutes}m`;
};

// Function to get status color
const getStatusColor = (status: string, timeElapsed: number): string => {
  if (status === 'completed') return 'bg-green-500';
  if (status === 'cancelled') return 'bg-red-500';
  
  // For pending or preparing orders, color based on time elapsed
  if (timeElapsed < 15) return 'bg-green-500'; // < 15 mins
  if (timeElapsed < 30) return 'bg-yellow-500'; // 15-30 mins
  return 'bg-red-500'; // > 30 mins
};

const OrdersList: React.FC = () => {
  const { getCurrentOrders, getDailyOrders, orders } = useOrder();
  const { isOwner } = useAuth();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'pending' | 'today'>('pending');
  
  // Get orders based on view mode
  const pendingOrders = getCurrentOrders();
  // Fetch all today's orders including completed ones (no filtering by status)
  const todayOrders = getDailyOrders(new Date().toISOString().split('T')[0]);
  
  const displayOrders = viewMode === 'pending' ? pendingOrders : todayOrders;

  const handleViewOrder = (orderId: string) => {
    navigate(`/pos/view-order/${orderId}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Button 
          variant={viewMode === 'pending' ? 'default' : 'outline'}
          onClick={() => setViewMode('pending')}
          className={viewMode === 'pending' ? 'bg-mir-red text-white' : ''}
        >
          Pending Orders ({pendingOrders.length})
        </Button>
        <Button 
          variant={viewMode === 'today' ? 'default' : 'outline'}
          onClick={() => setViewMode('today')}
          className={viewMode === 'today' ? 'bg-mir-red text-white' : ''}
        >
          Today's Receipts ({todayOrders.length})
        </Button>
      </div>
      
      {orders.length === 0 && (
        <Card className="shadow-sm">
          <CardContent className="p-4 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-yellow-500 mb-2" />
            <p className="text-gray-500">Unable to fetch orders from database</p>
            <p className="text-sm text-gray-400">Please check your database connection</p>
          </CardContent>
        </Card>
      )}
      
      {orders.length > 0 && displayOrders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No {viewMode === 'pending' ? 'pending' : 'today\'s'} orders found
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 pb-4">
          {displayOrders.map((order) => {
            const timeElapsedMinutes = Math.floor(
              (new Date().getTime() - new Date(order.createdAt).getTime()) / (1000 * 60)
            );
            
            return (
              <Card key={order.id} className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <h3 className="font-bold text-lg">
                          #{order.id.slice(-4)}
                        </h3>
                        <Badge className={`ml-2 ${getStatusColor(order.status, timeElapsedMinutes)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600">
                        {order.type === 'dine-in' 
                          ? `Table ${order.tableNumber}` 
                          : order.type.charAt(0).toUpperCase() + order.type.slice(1)}
                      </p>
                      
                      <div className="flex items-center mt-1 text-sm text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTimeElapsed(order.createdAt)}
                      </div>
                      
                      <div className="mt-2">
                        <p className="text-sm">{order.items.length} items</p>
                        <p className="font-semibold">₹{order.totalAmount.toFixed(2)}</p>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center" 
                      onClick={() => handleViewOrder(order.id)}
                    >
                      {order.status === 'completed' ? (
                        <>
                          <Receipt className="h-4 w-4 mr-1" />
                          View Receipt
                        </>
                      ) : (
                        <>
                          View
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersList;
