
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useInventory } from '@/contexts/InventoryContext';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Plus, Clock, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';

const PurchasesPage = () => {
  const navigate = useNavigate();
  const { purchaseLogs } = useInventory();
  const { currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [currentUserLogs, setCurrentUserLogs] = useState<any[]>([]);
  const [date, setDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Filter purchase logs by date and current user
  useEffect(() => {
    if (!currentUser) return;

    const filteredLogs = purchaseLogs
      .filter(log => log.staffId === currentUser.id)
      .filter(log => {
        // Filter by date
        return log.date.startsWith(date);
      })
      .filter(log => {
        if (!search) return true;
        // Search in item names
        return log.items.some(item => 
          item.itemName.toLowerCase().includes(search.toLowerCase())
        );
      });

    setCurrentUserLogs(filteredLogs);
  }, [purchaseLogs, currentUser, date, search]);

  return (
    <Layout title="Daily Purchases" showBackButton>
      <div className="mir-container pb-20">
        <div className="mb-4">
          <Input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)}
            className="w-full mb-2"
          />
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search purchases..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {currentUserLogs.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-mir-gray mx-auto mb-2" />
            <h3 className="text-xl font-bold text-mir-black mb-2">No purchases yet</h3>
            <p className="text-mir-gray-dark mb-4">
              {date === new Date().toISOString().split('T')[0]
                ? "You haven't recorded any purchases today"
                : `No purchases found for ${new Date(date).toLocaleDateString()}`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {currentUserLogs.map((log) => (
              <Card key={log.id} className="bg-white shadow-sm">
                <CardContent className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-mir-black">
                        {new Date(log.date).toLocaleDateString()}
                      </h3>
                      <p className="text-xs text-mir-gray-dark flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-mir-black">₹{log.totalAmount.toFixed(2)}</p>
                      <p className="text-xs text-mir-gray-dark">{log.items.length} items</p>
                    </div>
                  </div>
                  
                  <div className="space-y-1 mt-2">
                    {log.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.itemName}</span>
                        <span>₹{(item.quantity * item.unitPrice).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-3 pt-2 border-t border-gray-100">
                    <div className="flex justify-between text-sm">
                      <span>Money Received</span>
                      <span>₹{log.moneyReceived.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium">
                      <span>Balance</span>
                      <span>₹{log.balance.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Purchase Button */}
      <div className="fixed bottom-16 right-4">
        <Button 
          className="rounded-full h-14 w-14 bg-mir-red text-white shadow-lg hover:bg-mir-red/90"
          onClick={() => navigate('/purchases/add')}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </Layout>
  );
};

export default PurchasesPage;
