
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useOrder } from '@/contexts/OrderContext';
import { useInventory } from '@/contexts/InventoryContext';
import { useMenu } from '@/contexts/MenuContext';
import { useAttendance } from '@/contexts/AttendanceContext';
import { useAuth } from '@/contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, TrendingUp, TrendingDown, Package, Clock, Users, DollarSign, ShoppingCart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const DashboardPage = () => {
  const { orders } = useOrder();
  const { items: inventoryItems, getLowStockItems, purchaseLogs } = useInventory();
  const { items: menuItems } = useMenu();
  const { entries, getPresentStaff, cashRegisterEntries } = useAttendance();
  const { isOwner, staffMembers } = useAuth();
  
  const [activeTab, setActiveTab] = useState<string>('sales');
  const [salesDateRange, setSalesDateRange] = useState<string>('week');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [fixedCosts, setFixedCosts] = useState<{ rent: string; salary: string; utilities: string; other: string }>({
    rent: '10000',
    salary: '15000',
    utilities: '5000',
    other: '2000',
  });

  // Set initial date range
  useEffect(() => {
    const today = new Date();
    const endFormatted = today.toISOString().split('T')[0];
    
    let startFormatted = '';
    if (salesDateRange === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(today.getDate() - 7);
      startFormatted = weekAgo.toISOString().split('T')[0];
    } else if (salesDateRange === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(today.getMonth() - 1);
      startFormatted = monthAgo.toISOString().split('T')[0];
    } else if (salesDateRange === 'year') {
      const yearAgo = new Date();
      yearAgo.setFullYear(today.getFullYear() - 1);
      startFormatted = yearAgo.toISOString().split('T')[0];
    }
    
    setStartDate(startFormatted);
    setEndDate(endFormatted);
  }, [salesDateRange]);

  // Filter orders by date range
  const getFilteredOrders = () => {
    if (!startDate || !endDate) return [];
    
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include the entire end day
      
      return orderDate >= start && orderDate <= end && order.status === 'completed';
    });
  };

  // Get order data for sales chart
  const getSalesChartData = () => {
    const filteredOrders = getFilteredOrders();
    
    // Group by date
    const salesByDate = filteredOrders.reduce((acc: any, order) => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      
      if (!acc[date]) {
        acc[date] = {
          date,
          sales: 0,
          orders: 0,
        };
      }
      
      acc[date].sales += order.totalAmount;
      acc[date].orders += 1;
      
      return acc;
    }, {});
    
    // Convert to array and sort by date
    return Object.values(salesByDate).sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  };

  // Get top selling items data
  const getTopSellingItems = () => {
    const filteredOrders = getFilteredOrders();
    
    // Extract all items from orders
    const allItems = filteredOrders.flatMap(order => 
      order.items.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        revenue: item.price * item.quantity,
      }))
    );
    
    // Group by item id
    const itemSales = allItems.reduce((acc: any, item) => {
      if (!acc[item.id]) {
        acc[item.id] = {
          id: item.id,
          name: item.name,
          quantity: 0,
          revenue: 0,
        };
      }
      
      acc[item.id].quantity += item.quantity;
      acc[item.id].revenue += item.revenue;
      
      return acc;
    }, {});
    
    // Convert to array, sort by quantity, and take top 5
    return Object.values(itemSales)
      .sort((a: any, b: any) => b.quantity - a.quantity)
      .slice(0, 5);
  };

  // Get payment method distribution data
  const getPaymentMethodData = () => {
    const filteredOrders = getFilteredOrders();
    
    const methodCounts = filteredOrders.reduce((acc: any, order) => {
      if (!order.paymentDetails) return acc;
      
      const method = order.paymentDetails.method;
      if (!acc[method]) {
        acc[method] = {
          name: method === 'cash' ? 'Cash' : method === 'upi' ? 'UPI' : 'Split',
          value: 0,
        };
      }
      
      acc[method].value += 1;
      
      return acc;
    }, {});
    
    return Object.values(methodCounts);
  };

  // Get summary metrics
  const getTotalSales = () => {
    const filteredOrders = getFilteredOrders();
    return filteredOrders.reduce((total, order) => total + order.totalAmount, 0);
  };

  const getTotalExpenses = () => {
    // Filter purchase logs by date range
    const filteredLogs = purchaseLogs.filter(log => {
      const logDate = new Date(log.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      return logDate >= start && logDate <= end;
    });
    
    // Sum up the expenses
    return filteredLogs.reduce((total, log) => total + log.totalAmount, 0);
  };

  const getTotalProfit = () => {
    const totalSales = getTotalSales();
    const totalExpenses = getTotalExpenses();
    const totalFixedCosts = parseFloat(fixedCosts.rent) + 
                            parseFloat(fixedCosts.salary) + 
                            parseFloat(fixedCosts.utilities) + 
                            parseFloat(fixedCosts.other);
    
    return totalSales - totalExpenses - totalFixedCosts;
  };

  // Calculate staff balance summary
  const getStaffBalance = () => {
    // Get the most recent cash register entry for each staff
    const staffBalances = staffMembers.map(staff => {
      const entries = cashRegisterEntries
        .filter(entry => entry.staffId === staff.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      const latestEntry = entries[0];
      
      return {
        id: staff.id,
        name: staff.name,
        balance: latestEntry ? 
          (latestEntry.moneyReceived || 0) - (latestEntry.totalAmount || 0) : 0,
        date: latestEntry ? latestEntry.date : null,
      };
    });
    
    return staffBalances.filter(staff => staff.balance !== 0);
  };

  // Prepare chart colors
  const COLORS = ['#ea384c', '#fcb900', '#333333', '#999999'];

  // Check if user is owner
  if (!isOwner) {
    return (
      <Layout title="Dashboard" showBackButton>
        <div className="mir-container">
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <Users className="h-12 w-12 text-mir-red mx-auto mb-3" />
            <h2 className="text-xl font-bold text-mir-black mb-2">Owner Access Required</h2>
            <p className="text-mir-gray-dark">
              This dashboard is only accessible to owner accounts. Please log in as an owner to view analytics.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard" showBackButton>
      <div className="mir-container pb-20">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
            <TabsTrigger value="finances">Finances</TabsTrigger>
          </TabsList>
          
          {/* Sales Tab */}
          <TabsContent value="sales" className="space-y-4">
            {/* Date Range Selector */}
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="flex space-x-2 mb-3">
                <Button 
                  variant={salesDateRange === 'week' ? 'default' : 'outline'} 
                  size="sm"
                  className={salesDateRange === 'week' ? 'bg-mir-red text-white' : ''}
                  onClick={() => setSalesDateRange('week')}
                >
                  Week
                </Button>
                <Button 
                  variant={salesDateRange === 'month' ? 'default' : 'outline'}
                  size="sm" 
                  className={salesDateRange === 'month' ? 'bg-mir-red text-white' : ''}
                  onClick={() => setSalesDateRange('month')}
                >
                  Month
                </Button>
                <Button 
                  variant={salesDateRange === 'year' ? 'default' : 'outline'} 
                  size="sm"
                  className={salesDateRange === 'year' ? 'bg-mir-red text-white' : ''}
                  onClick={() => setSalesDateRange('year')}
                >
                  Year
                </Button>
                <Button 
                  variant={salesDateRange === 'custom' ? 'default' : 'outline'} 
                  size="sm"
                  className={salesDateRange === 'custom' ? 'bg-mir-red text-white' : ''}
                  onClick={() => setSalesDateRange('custom')}
                >
                  Custom
                </Button>
              </div>
              
              {salesDateRange === 'custom' && (
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <label className="text-xs text-mir-gray-dark">Start Date</label>
                    <Input 
                      type="date" 
                      value={startDate} 
                      onChange={(e) => setStartDate(e.target.value)} 
                    />
                  </div>
                  <div>
                    <label className="text-xs text-mir-gray-dark">End Date</label>
                    <Input 
                      type="date" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)} 
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
              )}
              
              <div className="text-sm text-mir-gray-dark">
                Showing data from <span className="font-medium">{new Date(startDate).toLocaleDateString()}</span> to <span className="font-medium">{new Date(endDate).toLocaleDateString()}</span>
              </div>
            </div>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-mir-gray-dark">Total Sales</p>
                      <p className="text-xl font-bold">₹{getTotalSales().toFixed(2)}</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-mir-red" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-mir-gray-dark">Orders</p>
                      <p className="text-xl font-bold">{getFilteredOrders().length}</p>
                    </div>
                    <ShoppingCart className="h-8 w-8 text-mir-red" />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Sales Chart */}
            <Card>
              <CardHeader className="p-3 pb-0">
                <CardTitle className="text-lg">Sales Trend</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getSalesChartData()}
                      margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                        }}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: any) => [`₹${value}`, 'Sales']}
                        labelFormatter={(label) => new Date(label).toLocaleDateString()}
                      />
                      <Bar dataKey="sales" fill="#ea384c" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Top Selling Items & Payment Methods */}
            <div className="grid grid-cols-1 gap-4">
              <Card>
                <CardHeader className="p-3 pb-0">
                  <CardTitle className="text-lg">Top Selling Items</CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  {getTopSellingItems().length > 0 ? (
                    <div className="space-y-2">
                      {getTopSellingItems().map((item: any, index: number) => (
                        <div key={item.id} className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Badge variant="outline" className="mr-2 bg-mir-red/10 text-mir-red border-mir-red/20">
                              {index + 1}
                            </Badge>
                            <span className="font-medium">{item.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{item.quantity} units</p>
                            <p className="text-xs text-mir-gray-dark">₹{item.revenue.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-mir-gray-dark py-2">No sales data available</p>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="p-3 pb-0">
                  <CardTitle className="text-lg">Payment Methods</CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  {getPaymentMethodData().length > 0 ? (
                    <div className="h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={getPaymentMethodData()}
                            cx="50%"
                            cy="50%"
                            outerRadius={60}
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {getPaymentMethodData().map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: any) => [`${value} orders`, 'Count']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-center text-mir-gray-dark py-8">No payment data available</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-4">
            {/* Inventory Summary */}
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-mir-gray-dark">Total Items</p>
                      <p className="text-xl font-bold">{inventoryItems.length}</p>
                    </div>
                    <Package className="h-8 w-8 text-mir-red" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-mir-gray-dark">Low Stock</p>
                      <p className="text-xl font-bold">{getLowStockItems().length}</p>
                    </div>
                    <TrendingDown className="h-8 w-8 text-amber-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Low Stock Items */}
            <Card>
              <CardHeader className="p-3 pb-0">
                <CardTitle className="text-lg">Low Stock Alert</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                {getLowStockItems().length > 0 ? (
                  <div className="space-y-2">
                    {getLowStockItems().map((item) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-mir-gray-dark">{item.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-red-500">
                            {item.quantity} {item.unit}
                          </p>
                          <p className="text-xs text-mir-gray-dark">
                            Threshold: {item.lowStockThreshold} {item.unit}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-mir-gray-dark py-3">No low stock items</p>
                )}
              </CardContent>
            </Card>
            
            {/* Recent Purchases */}
            <Card>
              <CardHeader className="p-3 pb-0">
                <CardTitle className="text-lg">Recent Purchases</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                {purchaseLogs.length > 0 ? (
                  <div className="space-y-2">
                    {purchaseLogs
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .slice(0, 5)
                      .map((log) => (
                        <div key={log.id} className="border-b pb-2 last:border-b-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">₹{log.totalAmount.toFixed(2)}</p>
                              <p className="text-xs text-mir-gray-dark">{log.staffName}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm">
                                {new Date(log.date).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-mir-gray-dark">
                                {log.items.length} items
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-center text-mir-gray-dark py-3">No purchase records</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Staff Tab */}
          <TabsContent value="staff" className="space-y-4">
            {/* Staff Summary */}
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-mir-gray-dark">Total Staff</p>
                      <p className="text-xl font-bold">{staffMembers.length - 1}</p>
                    </div>
                    <Users className="h-8 w-8 text-mir-red" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-mir-gray-dark">Present Today</p>
                      <p className="text-xl font-bold">{getPresentStaff().length}</p>
                    </div>
                    <Clock className="h-8 w-8 text-mir-red" />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Staff Balance Summary */}
            <Card>
              <CardHeader className="p-3 pb-0">
                <CardTitle className="text-lg">Staff Balance Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                {getStaffBalance().length > 0 ? (
                  <div className="space-y-2">
                    {getStaffBalance().map((staff) => (
                      <div key={staff.id} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{staff.name}</p>
                          {staff.date && (
                            <p className="text-xs text-mir-gray-dark">
                              Last updated: {new Date(staff.date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${staff.balance < 0 ? 'text-red-500' : 'text-green-600'}`}>
                            ₹{Math.abs(staff.balance).toFixed(2)}
                          </p>
                          <p className="text-xs text-mir-gray-dark">
                            {staff.balance < 0 ? 'Owes' : 'Excess'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-mir-gray-dark py-3">No balance records</p>
                )}
              </CardContent>
            </Card>
            
            {/* Staff Attendance */}
            <Card>
              <CardHeader className="p-3 pb-0">
                <CardTitle className="text-lg">Today's Attendance</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="space-y-2">
                  {staffMembers
                    .filter(staff => staff.role !== 'owner')
                    .map((staff) => {
                      const staffEntry = entries.find(
                        entry => 
                          entry.staffId === staff.id && 
                          entry.date === new Date().toISOString().split('T')[0]
                      );
                      
                      return (
                        <div key={staff.id} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{staff.name}</p>
                          </div>
                          <div>
                            {staffEntry ? (
                              staffEntry.checkOutTime ? (
                                <Badge className="bg-gray-100 text-gray-700">Completed Shift</Badge>
                              ) : (
                                <Badge className="bg-green-100 text-green-700">Present</Badge>
                              )
                            ) : (
                              <Badge variant="outline" className="bg-red-50 text-red-500">Absent</Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Finances Tab */}
          <TabsContent value="finances" className="space-y-4">
            {/* Financial Summary */}
            <div className="grid grid-cols-3 gap-3">
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-mir-gray-dark">Sales</p>
                      <p className="text-lg font-bold">₹{getTotalSales().toFixed(2)}</p>
                    </div>
                    <TrendingUp className="h-6 w-6 text-mir-red" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-mir-gray-dark">Expenses</p>
                      <p className="text-lg font-bold">₹{getTotalExpenses().toFixed(2)}</p>
                    </div>
                    <TrendingDown className="h-6 w-6 text-amber-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-mir-gray-dark">Profit</p>
                      <p className={`text-lg font-bold ${getTotalProfit() < 0 ? 'text-red-500' : 'text-green-600'}`}>
                        ₹{getTotalProfit().toFixed(2)}
                      </p>
                    </div>
                    <DollarSign className={`h-6 w-6 ${getTotalProfit() < 0 ? 'text-red-500' : 'text-green-600'}`} />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Fixed Costs */}
            <Card>
              <CardHeader className="p-3 pb-0">
                <CardTitle className="text-lg">Fixed Costs</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-mir-gray-dark">Rent</label>
                      <Input 
                        type="number" 
                        value={fixedCosts.rent} 
                        onChange={(e) => setFixedCosts({ ...fixedCosts, rent: e.target.value })} 
                        placeholder="Monthly rent" 
                      />
                    </div>
                    <div>
                      <label className="text-xs text-mir-gray-dark">Salary</label>
                      <Input 
                        type="number" 
                        value={fixedCosts.salary} 
                        onChange={(e) => setFixedCosts({ ...fixedCosts, salary: e.target.value })} 
                        placeholder="Staff salary" 
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-mir-gray-dark">Utilities</label>
                      <Input 
                        type="number" 
                        value={fixedCosts.utilities} 
                        onChange={(e) => setFixedCosts({ ...fixedCosts, utilities: e.target.value })} 
                        placeholder="Electricity, water, etc." 
                      />
                    </div>
                    <div>
                      <label className="text-xs text-mir-gray-dark">Other</label>
                      <Input 
                        type="number" 
                        value={fixedCosts.other} 
                        onChange={(e) => setFixedCosts({ ...fixedCosts, other: e.target.value })} 
                        placeholder="Miscellaneous" 
                      />
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <div className="flex justify-between">
                      <span className="font-medium">Total Fixed Costs</span>
                      <span className="font-medium">
                        ₹{(parseFloat(fixedCosts.rent) + 
                            parseFloat(fixedCosts.salary) + 
                            parseFloat(fixedCosts.utilities) + 
                            parseFloat(fixedCosts.other)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Profit & Loss Summary */}
            <Card>
              <CardHeader className="p-3 pb-0">
                <CardTitle className="text-lg">Profit & Loss Statement</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Sales Revenue</span>
                    <span>₹{getTotalSales().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Purchase Expenses</span>
                    <span>₹{getTotalExpenses().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fixed Costs</span>
                    <span>
                      ₹{(parseFloat(fixedCosts.rent) + 
                          parseFloat(fixedCosts.salary) + 
                          parseFloat(fixedCosts.utilities) + 
                          parseFloat(fixedCosts.other)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t">
                    <span>Net Profit</span>
                    <span className={getTotalProfit() < 0 ? 'text-red-500' : 'text-green-600'}>
                      ₹{getTotalProfit().toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default DashboardPage;
