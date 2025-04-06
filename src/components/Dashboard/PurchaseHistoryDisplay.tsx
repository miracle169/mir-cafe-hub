import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Filter, Calendar } from 'lucide-react';

interface Purchase {
  id: string;
  date: string;
  staff_name: string;
  staff_id: string;
  total_amount: number;
  money_received: number;
  balance: number;
  items: {
    name: string;
    quantity: number;
    unit_price: number;
    total: number;
  }[];
}

interface StaffBalance {
  staff_id: string;
  staff_name: string;
  total_given: number;
  total_spent: number;
  balance: number;
}

interface ItemSummary {
  name: string;
  quantity: number;
  totalAmount: number;
}

interface StaffResponse {
  name: string;
}

interface InventoryItemResponse {
  name: string;
}

const PurchaseHistoryDisplay = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [filteredPurchases, setFilteredPurchases] = useState<Purchase[]>([]);
  const [staffBalances, setStaffBalances] = useState<StaffBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('month');
  const [selectedDateRange, setSelectedDateRange] = useState<{
    start: string;
    end: string;
  }>({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  });
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    fetchPurchases();
  }, []);
  
  useEffect(() => {
    filterPurchases();
  }, [purchases, filterType, selectedDateRange, searchTerm]);
  
  const fetchPurchases = async () => {
    try {
      setLoading(true);
      
      const { data: purchasesData, error: purchasesError } = await supabase
        .from('purchase_logs')
        .select(`
          id,
          date,
          total_amount,
          money_received,
          balance,
          staff_id,
          staff:staff_id (
            name
          )
        `)
        .order('date', { ascending: false });
        
      if (purchasesError) throw purchasesError;
      
      const purchasesWithItems = await Promise.all(
        purchasesData.map(async (purchase) => {
          const { data: itemsData, error: itemsError } = await supabase
            .from('purchase_items')
            .select(`
              quantity,
              unit_price,
              inventory_items:item_id (
                name
              )
            `)
            .eq('purchase_id', purchase.id);
            
          if (itemsError) throw itemsError;
          
          return {
            id: purchase.id,
            date: purchase.date,
            staff_name: purchase.staff?.name || 'Unknown',
            staff_id: purchase.staff_id,
            total_amount: purchase.total_amount,
            money_received: purchase.money_received,
            balance: purchase.balance,
            items: itemsData.map(item => ({
              name: item.inventory_items?.name || 'Unknown Item',
              quantity: item.quantity,
              unit_price: item.unit_price,
              total: item.quantity * item.unit_price
            }))
          };
        })
      );
      
      setPurchases(purchasesWithItems);
      calculateStaffBalances(purchasesWithItems);
    } catch (error) {
      console.error('Error fetching purchases:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const calculateStaffBalances = (purchaseData: Purchase[]) => {
    const balances = new Map<string, StaffBalance>();
    
    purchaseData.forEach(purchase => {
      if (!balances.has(purchase.staff_id)) {
        balances.set(purchase.staff_id, {
          staff_id: purchase.staff_id,
          staff_name: purchase.staff_name,
          total_given: 0,
          total_spent: 0,
          balance: 0
        });
      }
      
      const staffBalance = balances.get(purchase.staff_id)!;
      staffBalance.total_given += purchase.money_received;
      staffBalance.total_spent += purchase.total_amount;
      staffBalance.balance = staffBalance.total_given - staffBalance.total_spent;
    });
    
    setStaffBalances(Array.from(balances.values()));
  };
  
  const filterPurchases = () => {
    if (purchases.length === 0) return;
    
    let filtered = [...purchases];
    
    const startDate = new Date(selectedDateRange.start);
    const endDate = new Date(selectedDateRange.end);
    endDate.setHours(23, 59, 59);
    
    filtered = filtered.filter(purchase => {
      const purchaseDate = new Date(purchase.date);
      return purchaseDate >= startDate && purchaseDate <= endDate;
    });
    
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(purchase => 
        purchase.staff_name.toLowerCase().includes(lowerSearchTerm) ||
        purchase.items.some(item => 
          item.name.toLowerCase().includes(lowerSearchTerm)
        )
      );
    }
    
    setFilteredPurchases(filtered);
  };
  
  const handleDateRangeChange = (type: string) => {
    const today = new Date();
    
    switch (type) {
      case 'today':
        const todayStr = format(today, 'yyyy-MM-dd');
        setSelectedDateRange({ start: todayStr, end: todayStr });
        break;
      case 'week':
        setSelectedDateRange({
          start: format(subDays(today, 7), 'yyyy-MM-dd'),
          end: format(today, 'yyyy-MM-dd')
        });
        break;
      case 'month':
        setSelectedDateRange({
          start: format(startOfMonth(today), 'yyyy-MM-dd'),
          end: format(endOfMonth(today), 'yyyy-MM-dd')
        });
        break;
      case 'year':
        setSelectedDateRange({
          start: format(new Date(today.getFullYear(), 0, 1), 'yyyy-MM-dd'),
          end: format(new Date(today.getFullYear(), 11, 31), 'yyyy-MM-dd')
        });
        break;
      default:
        break;
    }
    
    setFilterType(type);
  };
  
  const handleDateInputChange = (field: 'start' | 'end', value: string) => {
    setSelectedDateRange(prev => ({
      ...prev,
      [field]: value
    }));
    setFilterType('custom');
  };
  
  const getTotalPurchases = () => {
    return filteredPurchases.reduce((sum, purchase) => sum + purchase.total_amount, 0);
  };
  
  const getMostPurchasedItems = () => {
    const itemCounts = new Map<string, { quantity: number, totalAmount: number }>();
    
    filteredPurchases.forEach(purchase => {
      purchase.items.forEach(item => {
        if (!itemCounts.has(item.name)) {
          itemCounts.set(item.name, { quantity: 0, totalAmount: 0 });
        }
        const current = itemCounts.get(item.name)!;
        current.quantity += item.quantity;
        current.totalAmount += item.total;
      });
    });
    
    return Array.from(itemCounts.entries())
      .map(([name, { quantity, totalAmount }]) => ({ 
        name, 
        quantity, 
        totalAmount 
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex flex-col md:flex-row gap-2">
          <Select value={filterType} onValueChange={handleDateRangeChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">This month</SelectItem>
              <SelectItem value="year">This year</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
          
          {filterType === 'custom' && (
            <div className="flex gap-2 items-center">
              <Label htmlFor="start-date">From</Label>
              <Input
                id="start-date"
                type="date"
                value={selectedDateRange.start}
                onChange={(e) => handleDateInputChange('start', e.target.value)}
                className="w-40"
              />
              <Label htmlFor="end-date">To</Label>
              <Input
                id="end-date"
                type="date"
                value={selectedDateRange.end}
                onChange={(e) => handleDateInputChange('end', e.target.value)}
                className="w-40"
              />
            </div>
          )}
        </div>
        
        <div className="relative">
          <Input
            placeholder="Search by staff or item name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 w-full md:w-[300px]"
          />
          <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{getTotalPurchases().toFixed(2)}</div>
            <p className="text-sm text-gray-500">
              {filteredPurchases.length} purchase records
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Date Range</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4 text-gray-500" />
              <span>
                {format(new Date(selectedDateRange.start), 'dd MMM yyyy')} -{' '}
                {format(new Date(selectedDateRange.end), 'dd MMM yyyy')}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Staff Involved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(filteredPurchases.map(p => p.staff_id)).size}
            </div>
            <p className="text-sm text-gray-500">
              Staff members made purchases
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Most Purchased Items</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <div className="space-y-4">
                {getMostPurchasedItems().map((item, index) => (
                  <div key={index} className="flex justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-medium">₹{item.totalAmount.toFixed(2)}</p>
                  </div>
                ))}
                
                {getMostPurchasedItems().length === 0 && (
                  <p className="text-center text-gray-500 py-4">No items found</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Staff Balances</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <div className="space-y-4">
                {staffBalances.map((staff) => (
                  <div key={staff.staff_id} className="flex justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">{staff.staff_name}</p>
                      <p className="text-sm text-gray-500">
                        Given: ₹{staff.total_given.toFixed(2)} | 
                        Spent: ₹{staff.total_spent.toFixed(2)}
                      </p>
                    </div>
                    <p className={`font-medium ${staff.balance < 0 ? 'text-red-500' : 'text-green-600'}`}>
                      ₹{staff.balance.toFixed(2)}
                    </p>
                  </div>
                ))}
                
                {staffBalances.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No staff balances found</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Purchase History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-4">Loading...</p>
          ) : (
            <div className="space-y-6">
              {filteredPurchases.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No purchase records found</p>
              ) : (
                filteredPurchases.map((purchase) => (
                  <div key={purchase.id} className="border rounded-lg p-4">
                    <div className="flex justify-between mb-2">
                      <div>
                        <p className="font-semibold">
                          Purchase #{purchase.id.substring(0, 8)}
                        </p>
                        <p className="text-sm text-gray-500">
                          By {purchase.staff_name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          ₹{purchase.total_amount.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(purchase.date), 'dd MMM yyyy')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <p className="text-sm font-medium mb-1">Items:</p>
                      <div className="space-y-1">
                        {purchase.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>
                              {item.quantity} × {item.name} (@₹{item.unit_price.toFixed(2)})
                            </span>
                            <span>₹{item.total.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-2 pt-2 border-t flex justify-between text-sm">
                      <span>Money received</span>
                      <span>₹{purchase.money_received.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm font-medium">
                      <span>Balance</span>
                      <span className={purchase.balance >= 0 ? 'text-green-600' : 'text-red-500'}>
                        ₹{purchase.balance.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchaseHistoryDisplay;
