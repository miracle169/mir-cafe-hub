
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Coffee, ShoppingBag, Users, CreditCard, Truck, Clipboard, FileText, ShoppingCart, Settings, LogOut, ListChecks, DollarSign, Clock, ClockIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import StaffLoginDialog from '@/components/Login/StaffLoginDialog';
import { ThemeProvider } from '@/components/theme-provider';
import { useTheme } from '@/hooks/use-theme';

const HomePage = () => {
  const { currentUser, isAuthenticated, logout, isOwner, checkIn, checkOut } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  
  // Check if user is authenticated, if not, show login dialog
  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoginDialogOpen(true);
    }
  }, [isAuthenticated]);
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      setIsLoginDialogOpen(true);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  // Handle check-in
  const handleCheckIn = async () => {
    await checkIn();
    setIsCheckedIn(true);
    
    // Auto-dismiss after 1 second
    setTimeout(() => {
      setIsCheckedIn(false);
    }, 1000);
  };
  
  // Handle check-out
  const handleCheckOut = async () => {
    await checkOut();
    setIsCheckedIn(false);
  };
  
  // Toggle theme
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  
  // Define menu items based on user role
  const getMenuItems = () => {
    const commonItems = [
      { to: '/pos', icon: <ShoppingCart className="h-6 w-6" />, label: 'Point of Sale', color: 'bg-blue-500' },
      { to: '/products', icon: <Coffee className="h-6 w-6" />, label: 'Products', color: 'bg-amber-500' },
      { to: '/receipts', icon: <FileText className="h-6 w-6" />, label: 'Receipts', color: 'bg-purple-500' },
    ];
    
    const ownerItems = [
      { to: '/inventory', icon: <ShoppingBag className="h-6 w-6" />, label: 'Inventory', color: 'bg-green-500' },
      { to: '/customers', icon: <Users className="h-6 w-6" />, label: 'Customers', color: 'bg-red-500' },
      { to: '/purchases', icon: <CreditCard className="h-6 w-6" />, label: 'Purchases', color: 'bg-indigo-500' },
      { to: '/attendance', icon: <Clock className="h-6 w-6" />, label: 'Attendance', color: 'bg-pink-500' },
      { to: '/cash-drawer', icon: <DollarSign className="h-6 w-6" />, label: 'Cash Drawer', color: 'bg-orange-500' },
      { to: '/dashboard', icon: <Clipboard className="h-6 w-6" />, label: 'Dashboard', color: 'bg-teal-500' },
      { to: '/staff-management', icon: <Users className="h-6 w-6" />, label: 'Staff', color: 'bg-sky-500' },
      { to: '/settings', icon: <Settings className="h-6 w-6" />, label: 'Settings', color: 'bg-gray-500' },
    ];
    
    return isOwner ? [...commonItems, ...ownerItems] : commonItems;
  };
  
  return (
    <ThemeProvider>
      <Layout title="Mir Cafe">
        <div className="p-4 min-h-screen">
          {isAuthenticated && currentUser ? (
            <>
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Welcome, {currentUser.name}!</h2>
                  <p className="text-gray-500 dark:text-gray-400">
                    {isOwner ? 'Cafe Owner' : 'Staff Member'}
                  </p>
                </div>
                <div className="flex gap-2">
                  {isCheckedIn ? (
                    <Button onClick={handleCheckOut} variant="outline">
                      <Clock className="mr-2 h-4 w-4" />
                      Check Out
                    </Button>
                  ) : (
                    <Button onClick={handleCheckIn} variant="outline">
                      <ClockIn className="mr-2 h-4 w-4" />
                      Check In
                    </Button>
                  )}
                  <Button variant="ghost" onClick={toggleTheme}>
                    {theme === 'dark' ? '🌞' : '🌙'}
                  </Button>
                  <Button variant="destructive" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {getMenuItems().map((item, index) => (
                  <Link to={item.to} key={index}>
                    <Card className="overflow-hidden h-full hover:shadow-md transition-shadow">
                      <CardContent className="p-0">
                        <div className={`${item.color} text-white p-6 flex justify-center`}>
                          {item.icon}
                        </div>
                        <div className="p-4 text-center font-medium">
                          {item.label}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[80vh]">
              <h1 className="text-3xl font-bold mb-4">Welcome to Mir Cafe</h1>
              <p className="text-gray-500 mb-6">Please log in to continue</p>
              <Button onClick={() => setIsLoginDialogOpen(true)}>
                <LogOut className="mr-2 h-4 w-4" />
                Login
              </Button>
            </div>
          )}
        </div>
        
        <StaffLoginDialog 
          open={isLoginDialogOpen} 
          onOpenChange={setIsLoginDialogOpen} 
        />
      </Layout>
    </ThemeProvider>
  );
};

export default HomePage;
