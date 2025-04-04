
import React from 'react';
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

const SettingsPage = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();

  // Check if user is owner (would typically come from auth context)
  const isOwner = currentUser?.role === 'owner';

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your settings have been updated successfully",
      duration: 1000,
    });
  };

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
                  <Input id="cafe-name" defaultValue="Mir Cafe" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" defaultValue="123 Main Street, City" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" defaultValue="+91 98765 43210" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="contact@mircafe.com" />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifications" className="cursor-pointer">Enable Notifications</Label>
                  <Switch id="notifications" defaultChecked />
                </div>

                <Button onClick={handleSave}>Save Changes</Button>
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
                  <Switch id="dark-mode" />
                </div>
                
                <div className="space-y-2">
                  <Label>Theme Color</Label>
                  <div className="grid grid-cols-5 gap-2">
                    <div className="w-10 h-10 rounded-full bg-red-500 cursor-pointer" />
                    <div className="w-10 h-10 rounded-full bg-blue-500 cursor-pointer" />
                    <div className="w-10 h-10 rounded-full bg-green-500 cursor-pointer" />
                    <div className="w-10 h-10 rounded-full bg-purple-500 cursor-pointer" />
                    <div className="w-10 h-10 rounded-full bg-yellow-500 cursor-pointer" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="compact-view" className="cursor-pointer">Compact View</Label>
                  <Switch id="compact-view" />
                </div>
                
                <Button onClick={handleSave}>Save Changes</Button>
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
                  <Input id="tax-rate" type="number" defaultValue="5" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input id="currency" defaultValue="₹" />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="round-totals" className="cursor-pointer">Round Totals</Label>
                  <Switch id="round-totals" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="service-charge" className="cursor-pointer">Include Service Charge</Label>
                  <Switch id="service-charge" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="service-rate">Service Charge Rate (%)</Label>
                  <Input id="service-rate" type="number" defaultValue="10" />
                </div>
                
                <Button onClick={handleSave}>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default SettingsPage;
