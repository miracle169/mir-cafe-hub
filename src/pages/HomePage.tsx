
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useAttendance } from '@/contexts/AttendanceContext';
import { BarChart, ShoppingCart, Users, Package, ClipboardList, Clock, Settings, Calendar, CreditCard } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const { currentUser, isOwner } = useAuth();
  const { getAttendanceForToday, checkIn, checkOut } = useAttendance();
  
  // Get today's attendance records for the current user
  const todayAttendance = currentUser ? getAttendanceForToday(currentUser.id) : [];
  const hasCheckedInToday = todayAttendance.length > 0;
  const lastCheckIn = todayAttendance[todayAttendance.length - 1];
  const hasCheckedOutToday = lastCheckIn && lastCheckIn.checkOutTime;
  
  const menuItems = [
    { name: 'POS', icon: ShoppingCart, path: '/pos', access: 'all' },
    { name: 'Receipts', icon: ClipboardList, path: '/receipts', access: 'all' },
    { name: 'Customers', icon: Users, path: '/customers', access: 'all' },
    { name: 'Inventory', icon: Package, path: '/inventory', access: 'all' },
    { name: 'Products', icon: Package, path: '/products', access: 'owner' },
    { name: 'Purchases', icon: ShoppingCart, path: '/purchases', access: 'all' },
    { name: 'Attendance', icon: Calendar, path: '/attendance', access: 'owner' },
    { name: 'Cash Drawer', icon: CreditCard, path: '/cash-drawer', access: 'owner' },
    { name: 'Dashboard', icon: BarChart, path: '/dashboard', access: 'owner' },
    { name: 'Settings', icon: Settings, path: '/settings', access: 'all' },
  ];
  
  const renderMenuItem = (item) => {
    if (item.access === 'owner' && !isOwner) {
      return null;
    }

    return (
      <Card key={item.name} className="shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardContent className="flex flex-col items-center justify-center p-6">
          <item.icon className="h-8 w-8 mb-4 text-mir-red" />
          <Button variant="ghost" onClick={() => navigate(item.path)}>
            {item.name}
          </Button>
        </CardContent>
      </Card>
    );
  };

  const handleCheckIn = async () => {
    if (currentUser) {
      try {
        await checkIn(); // Call checkIn without arguments
      } catch (error) {
        console.error("Failed to check in:", error);
      }
    }
  };

  const handleCheckOut = async () => {
    if (currentUser) {
      try {
        await checkOut(); // Call checkOut without arguments
      } catch (error) {
        console.error("Failed to check out:", error);
      }
    }
  };

  return (
    <Layout title="Home">
      <div className="mir-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {menuItems.map(renderMenuItem)}
        </div>

        {currentUser && (
          <Card className="shadow-md">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Attendance</h2>
              {hasCheckedInToday ? (
                <>
                  <p>You checked in today.</p>
                  {!hasCheckedOutToday && (
                    <Button onClick={handleCheckOut} className="bg-mir-red text-white mt-2">
                      Check Out
                    </Button>
                  )}
                  {hasCheckedOutToday && (
                    <div className="mt-2">
                      <p>You have already checked out from your last shift.</p>
                      <Button onClick={handleCheckIn} className="bg-mir-red text-white mt-2">
                        Start New Shift
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <Button onClick={handleCheckIn} className="bg-mir-red text-white">
                  Check In
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default HomePage;
