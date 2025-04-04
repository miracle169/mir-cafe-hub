
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { connectPrinter, disconnectPrinter, isPrinterConnected } from '@/utils/printing';
import { Printer, Bluetooth, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PrintSettingsProps {
  isOwner: boolean;
}

const PrintSettings: React.FC<PrintSettingsProps> = ({ isOwner }) => {
  const { toast } = useToast();
  const [printerConnected, setPrinterConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [billSettings, setBillSettings] = useState({
    printLogo: true,
    printAddress: true,
    printCustomerInfo: true,
    printItemizedDetails: true,
    printTaxDetails: true,
    printDiscountDetails: true,
    footerMessage: "Thank you for visiting Mir Cafe! We hope to see you again soon!",
    paperWidth: "58mm", // Standard 2-inch thermal paper width
  });
  
  const [kotSettings, setKotSettings] = useState({
    printTableNumber: true,
    printTime: true,
    printServername: true,
    footerMessage: "",
  });
  
  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedBillSettings = localStorage.getItem('mirCafePrintSettings');
      if (savedBillSettings) {
        setBillSettings(JSON.parse(savedBillSettings).bill || billSettings);
      }
      
      const savedKotSettings = localStorage.getItem('mirCafeKotSettings');
      if (savedKotSettings) {
        setKotSettings(JSON.parse(savedKotSettings).kot || kotSettings);
      }
      
      // Check printer connection status
      setPrinterConnected(isPrinterConnected());
    } catch (error) {
      console.error('Error loading print settings:', error);
    }
  }, []);
  
  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('mirCafePrintSettings', JSON.stringify({ bill: billSettings }));
  }, [billSettings]);
  
  useEffect(() => {
    localStorage.setItem('mirCafeKotSettings', JSON.stringify({ kot: kotSettings }));
  }, [kotSettings]);
  
  // Handle printer connection
  const handleConnectPrinter = async () => {
    setConnecting(true);
    try {
      const success = await connectPrinter();
      setPrinterConnected(success);
      
      if (success) {
        toast({
          title: "Printer Connected",
          description: "Your Bluetooth printer is now connected and ready to use",
          duration: 1000,
        });
      } else {
        toast({
          title: "Connection Failed",
          description: "Failed to connect to printer. Please try again.",
          variant: "destructive",
          duration: 1000,
        });
      }
    } catch (error) {
      console.error('Error connecting to printer:', error);
      toast({
        title: "Error",
        description: "An error occurred while connecting to the printer",
        variant: "destructive",
        duration: 1000,
      });
    } finally {
      setConnecting(false);
    }
  };
  
  // Handle printer disconnection
  const handleDisconnectPrinter = () => {
    disconnectPrinter();
    setPrinterConnected(false);
    toast({
      title: "Printer Disconnected",
      description: "Your Bluetooth printer has been disconnected",
      duration: 1000,
    });
  };
  
  // Update bill settings
  const updateBillSetting = (key: string, value: boolean | string) => {
    setBillSettings(prev => ({ ...prev, [key]: value }));
  };
  
  // Update KOT settings
  const updateKotSetting = (key: string, value: boolean | string) => {
    setKotSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bluetooth className="mr-2 h-4 w-4" />
            Bluetooth Printer Connection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Printer Status</p>
                <p className="text-sm text-mir-gray-dark">
                  {printerConnected ? "Connected" : "Not connected"}
                </p>
              </div>
              {printerConnected ? (
                <Button 
                  variant="outline" 
                  onClick={handleDisconnectPrinter}
                >
                  Disconnect
                </Button>
              ) : (
                <Button 
                  onClick={handleConnectPrinter}
                  disabled={connecting}
                >
                  <Bluetooth className="mr-2 h-4 w-4" />
                  {connecting ? "Connecting..." : "Connect Printer"}
                </Button>
              )}
            </div>
            
            <div className="bg-mir-gray-light p-3 rounded-md flex items-start mt-2">
              <Info className="h-4 w-4 text-mir-blue mr-2 mt-0.5" />
              <p className="text-xs text-mir-gray-dark">
                Make sure your Bluetooth printer is turned on and in pairing mode. 
                The app will scan for available Bluetooth printers.
              </p>
            </div>
            
            <div className="space-y-2 mt-4">
              <Label htmlFor="paperWidth">Paper Width</Label>
              <div className="flex space-x-2">
                <Button 
                  variant={billSettings.paperWidth === "58mm" ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateBillSetting('paperWidth', '58mm')}
                  className="flex-1"
                >
                  2 inch (58mm)
                </Button>
                <Button 
                  variant={billSettings.paperWidth === "80mm" ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateBillSetting('paperWidth', '80mm')}
                  className="flex-1"
                >
                  3 inch (80mm)
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bill Format Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="printLogo" className="cursor-pointer">Print Logo/Cafe Name</Label>
            <Switch 
              id="printLogo" 
              checked={billSettings.printLogo}
              onCheckedChange={(checked) => updateBillSetting('printLogo', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="printAddress" className="cursor-pointer">Print Cafe Address</Label>
            <Switch 
              id="printAddress" 
              checked={billSettings.printAddress}
              onCheckedChange={(checked) => updateBillSetting('printAddress', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="printCustomerInfo" className="cursor-pointer">Print Customer Info</Label>
            <Switch 
              id="printCustomerInfo" 
              checked={billSettings.printCustomerInfo}
              onCheckedChange={(checked) => updateBillSetting('printCustomerInfo', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="printItemizedDetails" className="cursor-pointer">Print Itemized Details</Label>
            <Switch 
              id="printItemizedDetails" 
              checked={billSettings.printItemizedDetails}
              onCheckedChange={(checked) => updateBillSetting('printItemizedDetails', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="printTaxDetails" className="cursor-pointer">Print Tax Details</Label>
            <Switch 
              id="printTaxDetails" 
              checked={billSettings.printTaxDetails}
              onCheckedChange={(checked) => updateBillSetting('printTaxDetails', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="printDiscountDetails" className="cursor-pointer">Print Discount Details</Label>
            <Switch 
              id="printDiscountDetails" 
              checked={billSettings.printDiscountDetails}
              onCheckedChange={(checked) => updateBillSetting('printDiscountDetails', checked)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="billFooter">Bill Footer Message</Label>
            <Textarea 
              id="billFooter" 
              value={billSettings.footerMessage}
              onChange={(e) => updateBillSetting('footerMessage', e.target.value)}
              rows={2}
              placeholder="Enter footer message to appear on bills"
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>KOT Format Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="printTableNumber" className="cursor-pointer">Print Table Number</Label>
            <Switch 
              id="printTableNumber" 
              checked={kotSettings.printTableNumber}
              onCheckedChange={(checked) => updateKotSetting('printTableNumber', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="printTime" className="cursor-pointer">Print Time & Date</Label>
            <Switch 
              id="printTime" 
              checked={kotSettings.printTime}
              onCheckedChange={(checked) => updateKotSetting('printTime', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="printServername" className="cursor-pointer">Print Server Name</Label>
            <Switch 
              id="printServername" 
              checked={kotSettings.printServername}
              onCheckedChange={(checked) => updateKotSetting('printServername', checked)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="kotFooter">KOT Footer Message</Label>
            <Textarea 
              id="kotFooter" 
              value={kotSettings.footerMessage}
              onChange={(e) => updateKotSetting('footerMessage', e.target.value)}
              rows={2}
              placeholder="Enter footer message to appear on KOTs"
            />
          </div>
        </CardContent>
      </Card>
      
      <div className="text-center">
        <Button 
          onClick={() => {
            toast({
              title: "Settings Saved",
              description: "Print settings have been updated successfully",
              duration: 1000,
            });
          }}
          className="bg-mir-red hover:bg-mir-red/90"
        >
          <Printer className="mr-2 h-4 w-4" />
          Save Print Settings
        </Button>
      </div>
    </div>
  );
};

export default PrintSettings;
