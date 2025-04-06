
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useAttendance } from '@/contexts/AttendanceContext';
import { useOrder } from '@/contexts/OrderContext';
import { useInventory } from '@/contexts/InventoryContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { AlertCircle } from 'lucide-react';
import PurchaseHistoryDisplay from '@/components/Dashboard/PurchaseHistoryDisplay';

const DashboardPage = () => {
  const { isOwner } = useAuth();
  const { attendanceRecords, getPresentStaff } = useAttendance();
  const { orders } = useOrder();
  const { items: inventoryItems, getLowStockItems } = useInventory();
  
  const [lowStockItems, setLowStockItems] = useState(getLowStockItems());
  const [presentStaff, setPresentStaff] = useState(getPresentStaff());
  const [salesData, setSalesData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    setLowStockItems(getLowStockItems());
    setPresentStaff(getPresentStaff());
    
    // Generate last 7 days of sales data
    const last7Days = Array.from({length: 7}, (_, i) => {
      const date = subDays(new Date(), i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      const dayOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= dayStart && orderDate <= dayEnd;
      });
      
      const totalSales = dayOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      
      return {
        date: format(date, 'MMM dd'),
        sales: totalSales
      };
    }).reverse();
    
    setSalesData(last7Days);
  }, [orders, inventoryItems, attendanceRecords, getLowStockItems, getPresentStaff]);

  // Generate category sales data for pie chart
  const generateCategorySalesData = () => {
    const categoryMap = new Map();
    
    orders.forEach(order => {
      order.items.forEach(item => {
        const category = item.category || 'Uncategorized';
        const amount = item.price * item.quantity;
        
        if (categoryMap.has(category)) {
          categoryMap.set(category, categoryMap.get(category) + amount);
        } else {
          categoryMap.set(category, amount);
        }
      });
    });
    
    return Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));
  };
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#e74c3c'];
  
  const categorySalesData = generateCategorySalesData();

  if (!isOwner) {
    return (
      <Layout title="Dashboard">
        <div className="p-4">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold mb-4">Access Restricted</h2>
            <p>You do not have permission to view the dashboard.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      <div className="p-4 max-w-7xl mx-auto">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="purchases">Purchase History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sales Today</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ₹{salesData[salesData.length - 1]?.sales.toFixed(2) || 0}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Present Staff</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{presentStaff.length}</div>
                  <div className="text-xs text-muted-foreground">
                    Staff currently present
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{lowStockItems.length}</div>
                  <div className="text-xs text-muted-foreground">
                    Items need restocking
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Last 7 Days</CardTitle>
                  <CardDescription>
                    Daily sales trend for the past week
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={salesData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="sales" fill="#8884d8" name="Sales (₹)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Sales by Category</CardTitle>
                  <CardDescription>
                    Distribution of sales across categories
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categorySalesData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {categorySalesData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: any) => {
                            // Check if value is a number before calling toFixed
                            return [typeof value === 'number' ? `₹${value.toFixed(2)}` : `₹${value}`, 'Sales'];
                          }} 
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {lowStockItems.length > 0 && (
              <Card className="border-red-200">
                <CardHeader className="pb-2">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    <CardTitle className="text-lg font-medium">Low Stock Items</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    {lowStockItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center border-b py-2">
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-500">
                            Category: {item.category}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-red-500 font-medium">
                            {item.quantity} {item.unit}
                          </div>
                          <div className="text-sm text-gray-500">
                            Threshold: {item.lowStockThreshold} {item.unit}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="purchases">
            <PurchaseHistoryDisplay />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default DashboardPage;
