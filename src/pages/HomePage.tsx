
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bluetooth, User, Coffee, Loader2, UserCircle } from 'lucide-react';
import { connectPrinter, isPrinterConnected } from '@/utils/printing';

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login, staffLogin, logout, currentUser, staffMembers } = useAuth();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('owner@mircafe.com');
  const [password, setPassword] = useState('owner123');
  const [staffName, setStaffName] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginTab, setLoginTab] = useState<string>('staff');

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    try {
      const result = await login(email, password);
      
      if (result.success) {
        navigate('/dashboard');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    try {
      const result = await staffLogin(staffName, staffPassword);
      
      if (result.success) {
        // Connect to printer after successful login
        try {
          if (!isPrinterConnected()) {
            await connectPrinter();
          }
        } catch (error) {
          console.error('Error connecting to printer:', error);
        }
        
        navigate('/pos');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (isAuthenticated && currentUser) {
    return (
      <div className="min-h-screen flex flex-col bg-mir-gray-light">
        <header className="bg-white shadow-sm py-4">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-mir-red">Mir Cafe Hub</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-mir-gray-dark hidden md:inline-block">
                Logged in as <span className="font-medium">{currentUser.name}</span>
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </header>
        
        <main className="flex-grow container mx-auto p-4 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/pos')}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Coffee className="h-5 w-5 text-mir-red" />
                  Point of Sale
                </CardTitle>
                <CardDescription>Process customer orders and payments</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-mir-gray-dark">
                  Create new orders, manage customer information, and process payments quickly.
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/inventory')}>
              <CardHeader className="pb-2">
                <CardTitle>Inventory</CardTitle>
                <CardDescription>Manage stock and supplies</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-mir-gray-dark">
                  Track inventory levels, add new items, and manage stock thresholds.
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/receipts')}>
              <CardHeader className="pb-2">
                <CardTitle>Receipts</CardTitle>
                <CardDescription>View and print receipts</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-mir-gray-dark">
                  Access order history, print receipts, and review transactions.
                </p>
              </CardContent>
            </Card>
            
            {currentUser.role === 'owner' && (
              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/dashboard')}>
                <CardHeader className="pb-2">
                  <CardTitle>Dashboard</CardTitle>
                  <CardDescription>Business analytics and insights</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-mir-gray-dark">
                    View sales reports, analyze trends, and monitor business performance.
                  </p>
                </CardContent>
              </Card>
            )}
            
            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/attendance')}>
              <CardHeader className="pb-2">
                <CardTitle>Attendance</CardTitle>
                <CardDescription>Track staff work hours</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-mir-gray-dark">
                  Monitor staff attendance, shifts, and work hours.
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/settings')}>
              <CardHeader className="pb-2">
                <CardTitle>Settings</CardTitle>
                <CardDescription>Configure system settings</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-mir-gray-dark">
                  Update business information, printer settings, and application preferences.
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
        
        <footer className="bg-white shadow-sm py-4 mt-auto">
          <div className="container mx-auto px-4 text-center text-sm text-mir-gray-dark">
            &copy; {new Date().getFullYear()} Mir Cafe Hub. All rights reserved.
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-mir-gray-light">
      <div className="w-full max-w-md p-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-mir-red">Mir Cafe Hub</h1>
          <p className="text-mir-gray-dark mt-2">Cafe Management System</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Login</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={loginTab} onValueChange={setLoginTab}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="staff">Staff Login</TabsTrigger>
                <TabsTrigger value="email">Admin Login</TabsTrigger>
              </TabsList>
              
              <TabsContent value="staff">
                <form onSubmit={handleStaffLogin} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="staff-name" className="block text-sm font-medium">
                      Staff Member
                    </label>
                    <Select value={staffName} onValueChange={setStaffName}>
                      <SelectTrigger id="staff-name">
                        <SelectValue placeholder="Select your name" />
                      </SelectTrigger>
                      <SelectContent>
                        {staffMembers.map((staff) => (
                          <SelectItem key={staff.id} value={staff.name}>
                            {staff.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="staff-password" className="block text-sm font-medium">
                      Password
                    </label>
                    <Input
                      id="staff-password"
                      type="password"
                      value={staffPassword}
                      onChange={(e) => setStaffPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full bg-mir-red hover:bg-mir-red/90" disabled={isLoggingIn}>
                    {isLoggingIn ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      <>
                        <UserCircle className="mr-2 h-4 w-4" />
                        Staff Login
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="email">
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium">
                      Password
                    </label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full bg-mir-red hover:bg-mir-red/90" disabled={isLoggingIn}>
                    {isLoggingIn ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      <>
                        <User className="mr-2 h-4 w-4" />
                        Login
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={async () => {
                try {
                  const connected = await connectPrinter();
                  if (connected) {
                    toast({
                      title: "Printer Connected",
                      description: "Your Bluetooth printer is now connected",
                      duration: 1000,
                    });
                  } else {
                    toast({
                      title: "Connection Failed",
                      description: "Failed to connect to printer",
                      variant: "destructive",
                      duration: 1000,
                    });
                  }
                } catch (error) {
                  toast({
                    title: "Error",
                    description: "Error connecting to printer",
                    variant: "destructive",
                    duration: 1000,
                  });
                }
              }}
            >
              <Bluetooth className="mr-2 h-4 w-4" />
              Connect Printer
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <footer className="mt-8 text-center text-sm text-mir-gray-dark">
        &copy; {new Date().getFullYear()} Mir Cafe Hub. All rights reserved.
      </footer>
    </div>
  );
};

export default HomePage;
