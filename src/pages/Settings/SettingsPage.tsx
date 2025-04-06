
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import PrintSettings from '@/components/Settings/PrintSettings';
import { useLocalStorage } from '@/hooks/use-local-storage'; // We'll create this hook

const SettingsPage = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();

  // Check if user is owner
  const isOwner = currentUser?.role === 'owner';

  // Cafe settings
  const [cafeName, setCafeName] = useLocalStorage('cafe-name', 'Mir Cafe');
  const [address, setAddress] = useLocalStorage('cafe-address', '123 Main Street, City');
  const [phone, setPhone] = useLocalStorage('cafe-phone', '+91 98765 43210');
  const [email, setEmail] = useLocalStorage('cafe-email', 'contact@mircafe.com');
  const [notifications, setNotifications] = useLocalStorage('notifications-enabled', true);

  // Appearance settings
  const [darkMode, setDarkMode] = useLocalStorage('dark-mode', false);
  const [themeColor, setThemeColor] = useLocalStorage('theme-color', 'red');
  const [compactView, setCompactView] = useLocalStorage('compact-view', false);

  // Billing settings
  const [taxRate, setTaxRate] = useLocalStorage('tax-rate', 5);
  const [currency, setCurrency] = useLocalStorage('currency', '₹');
  const [roundTotals, setRoundTotals] = useLocalStorage('round-totals', true);
  const [serviceCharge, setServiceCharge] = useLocalStorage('service-charge', false);
  const [serviceRate, setServiceRate] = useLocalStorage('service-rate', 10);

  const handleSave = (section) => {
    toast({
      title: "Settings Saved",
      description: `Your ${section} settings have been updated successfully`,
      duration: 1000,
    });
  };

  // Apply theme color
  React.useEffect(() => {
    const root = document.documentElement;
    const colors = {
      'red': 'var(--mir-red)',
      'blue': '#3b82f6',
      'green': '#22c55e',
      'purple': '#8b5cf6',
      'yellow': '#eab308'
    };
    
    // Apply the theme color to the CSS variable
    if (colors[themeColor]) {
      root.style.setProperty('--color-primary', colors[themeColor]);
    }
    
    // Apply dark mode
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    
    // Apply compact view
    if (compactView) {
      document.body.classList.add('compact');
    } else {
      document.body.classList.remove('compact');
    }
  }, [themeColor, darkMode, compactView]);

  return (
    <Layout title="Settings" showBackButton>
      <div className="mir-container">
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="printing">Printing</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cafe-name">Cafe Name</Label>
                  <Input 
                    id="cafe-name" 
                    value={cafeName} 
                    onChange={(e) => setCafeName(e.target.value)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input 
                    id="address" 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifications" className="cursor-pointer">Enable Notifications</Label>
                  <Switch 
                    id="notifications" 
                    checked={notifications} 
                    onCheckedChange={setNotifications} 
                  />
                </div>

                <Button onClick={() => handleSave('general')}>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="dark-mode" className="cursor-pointer">Dark Mode</Label>
                  <Switch 
                    id="dark-mode" 
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Theme Color</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {['red', 'blue', 'green', 'purple', 'yellow'].map((color) => (
                      <div
                        key={color}
                        className={`w-10 h-10 rounded-full cursor-pointer ${
                          themeColor === color ? 'ring-2 ring-offset-2 ring-black' : ''
                        } bg-${color}-500`}
                        style={{ backgroundColor: 
                          color === 'red' ? '#ef4444' : 
                          color === 'blue' ? '#3b82f6' : 
                          color === 'green' ? '#22c55e' : 
                          color === 'purple' ? '#8b5cf6' : 
                          '#eab308' 
                        }}
                        onClick={() => setThemeColor(color)}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="compact-view" className="cursor-pointer">Compact View</Label>
                  <Switch 
                    id="compact-view" 
                    checked={compactView}
                    onCheckedChange={setCompactView}
                  />
                </div>
                
                <Button onClick={() => handleSave('appearance')}>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="printing">
            <PrintSettings isOwner={isOwner} />
          </TabsContent>
          
          <TabsContent value="billing">
            <Card>
              <CardHeader>
                <CardTitle>Billing Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                  <Input 
                    id="tax-rate" 
                    type="number" 
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseInt(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input 
                    id="currency" 
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="round-totals" className="cursor-pointer">Round Totals</Label>
                  <Switch 
                    id="round-totals" 
                    checked={roundTotals}
                    onCheckedChange={setRoundTotals}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="service-charge" className="cursor-pointer">Include Service Charge</Label>
                  <Switch 
                    id="service-charge" 
                    checked={serviceCharge}
                    onCheckedChange={setServiceCharge}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="service-rate">Service Charge Rate (%)</Label>
                  <Input 
                    id="service-rate" 
                    type="number" 
                    value={serviceRate}
                    onChange={(e) => setServiceRate(parseInt(e.target.value))}
                  />
                </div>
                
                <Button onClick={() => handleSave('billing')}>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default SettingsPage;
