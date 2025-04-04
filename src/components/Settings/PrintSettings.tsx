
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Bluetooth, Printer, Save } from 'lucide-react';
import { connectPrinter, disconnectPrinter, isPrinterConnected } from '@/utils/printing';
import { useToast } from '@/hooks/use-toast';

interface PrintSettingsProps {
  isOwner?: boolean;
}

const PrintSettings: React.FC<PrintSettingsProps> = ({ isOwner = false }) => {
  const [printerConnected, setPrinterConnected] = useState(isPrinterConnected);
  const [connecting, setConnecting] = useState(false);
  const [showPrinterDialog, setShowPrinterDialog] = useState(false);
  const [showBillFormatDialog, setShowBillFormatDialog] = useState(false);
  const [showKotFormatDialog, setShowKotFormatDialog] = useState(false);
  
  // Bill format settings
  const [printLogo, setPrintLogo] = useState(true);
  const [printAddress, setPrintAddress] = useState(true);
  const [printCustomerInfo, setPrintCustomerInfo] = useState(true);
  const [printItemizedDetails, setPrintItemizedDetails] = useState(true);
  const [printTaxDetails, setPrintTaxDetails] = useState(true);
  const [printDiscountDetails, setPrintDiscountDetails] = useState(true);
  const [billFooterMessage, setBillFooterMessage] = useState("Thank you for visiting Mir Cafe! We hope to see you again soon!");
  
  // KOT format settings
  const [printKotTableNumber, setPrintKotTableNumber] = useState(true);
  const [printKotTime, setPrintKotTime] = useState(true);
  const [printKotServername, setPrintKotServername] = useState(true);
  const [kotFooterMessage, setKotFooterMessage] = useState("");
  
  const { toast } = useToast();

  const handleSaveBillSettings = () => {
    // Would typically save to localStorage or backend
    localStorage.setItem('mirCafePrintSettings', JSON.stringify({
      bill: {
        printLogo,
        printAddress,
        printCustomerInfo,
        printItemizedDetails,
        printTaxDetails,
        printDiscountDetails,
        footerMessage: billFooterMessage
      }
    }));
    
    toast({
      title: "Settings Saved",
      description: "Bill print settings have been saved",
      duration: 1000,
    });
    
    setShowBillFormatDialog(false);
  };

  const handleSaveKotSettings = () => {
    // Would typically save to localStorage or backend
    localStorage.setItem('mirCafeKotSettings', JSON.stringify({
      kot: {
        printTableNumber: printKotTableNumber,
        printTime: printKotTime,
        printServername: printKotServername,
        footerMessage: kotFooterMessage
      }
    }));
    
    toast({
      title: "Settings Saved",
      description: "KOT print settings have been saved",
      duration: 1000,
    });
    
    setShowKotFormatDialog(false);
  };

  const handleConnectPrinter = async () => {
    setConnecting(true);
    try {
      const connected = await connectPrinter();
      setPrinterConnected(connected);
      
      if (connected) {
        toast({
          title: "Printer Connected",
          description: "Successfully connected to printer",
          duration: 1000,
        });
      } else {
        toast({
          title: "Connection Failed",
          description: "Failed to connect to printer",
          duration: 1000,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error connecting to printer:', error);
      toast({
        title: "Connection Error",
        description: "An error occurred while connecting to printer",
        duration: 1000,
        variant: "destructive",
      });
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnectPrinter = () => {
    disconnectPrinter();
    setPrinterConnected(false);
    toast({
      title: "Printer Disconnected",
      description: "Printer has been disconnected",
      duration: 1000,
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Printer Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-md font-medium">Bluetooth Printer</h3>
              <p className="text-sm text-gray-500">Connect to a 2-inch thermal printer</p>
            </div>
            <Button 
              variant="outline" 
              className={printerConnected ? "bg-green-100" : ""}
              onClick={() => setShowPrinterDialog(true)}
            >
              <Bluetooth className={`h-4 w-4 mr-2 ${printerConnected ? "text-green-600" : ""}`} />
              {printerConnected ? "Connected" : "Connect"}
            </Button>
          </div>

          {isOwner && (
            <>
              <div className="pt-2 border-t">
                <h3 className="text-md font-medium mb-2">Print Format Settings</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowBillFormatDialog(true)}
                    className="flex justify-start"
                  >
                    <Printer className="h-4 w-4 mr-2" /> 
                    Configure Bill Format
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setShowKotFormatDialog(true)}
                    className="flex justify-start"
                  >
                    <Printer className="h-4 w-4 mr-2" /> 
                    Configure KOT Format
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Printer Connection Dialog */}
      <Dialog open={showPrinterDialog} onOpenChange={setShowPrinterDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Bluetooth Printer</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-mir-gray-dark mb-4">
              {printerConnected 
                ? "Printer is connected and ready to use." 
                : "Connect to a Bluetooth thermal printer to print receipts and KOTs."}
            </p>
            
            {printerConnected ? (
              <Button
                className="w-full"
                variant="outline"
                onClick={handleDisconnectPrinter}
              >
                Disconnect Printer
              </Button>
            ) : (
              <Button
                className="w-full"
                onClick={handleConnectPrinter}
                disabled={connecting}
              >
                {connecting ? "Connecting..." : "Connect to Printer"}
              </Button>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPrinterDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bill Format Dialog */}
      <Dialog open={showBillFormatDialog} onOpenChange={setShowBillFormatDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Bill Format Settings</DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="printLogo" className="cursor-pointer">Print Logo/Header</Label>
                <Switch 
                  id="printLogo" 
                  checked={printLogo} 
                  onCheckedChange={setPrintLogo} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="printAddress" className="cursor-pointer">Print Address/Contact</Label>
                <Switch 
                  id="printAddress" 
                  checked={printAddress} 
                  onCheckedChange={setPrintAddress} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="printCustomerInfo" className="cursor-pointer">Print Customer Information</Label>
                <Switch 
                  id="printCustomerInfo" 
                  checked={printCustomerInfo} 
                  onCheckedChange={setPrintCustomerInfo} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="printItemizedDetails" className="cursor-pointer">Print Itemized Details</Label>
                <Switch 
                  id="printItemizedDetails" 
                  checked={printItemizedDetails} 
                  onCheckedChange={setPrintItemizedDetails} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="printTaxDetails" className="cursor-pointer">Print Tax Details</Label>
                <Switch 
                  id="printTaxDetails" 
                  checked={printTaxDetails} 
                  onCheckedChange={setPrintTaxDetails} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="printDiscountDetails" className="cursor-pointer">Print Discount Details</Label>
                <Switch 
                  id="printDiscountDetails" 
                  checked={printDiscountDetails} 
                  onCheckedChange={setPrintDiscountDetails} 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="billFooter">Footer Message</Label>
              <Textarea 
                id="billFooter" 
                value={billFooterMessage} 
                onChange={(e) => setBillFooterMessage(e.target.value)}
                placeholder="Thank you message at the bottom of the bill"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBillFormatDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveBillSettings}
              className="ml-2"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* KOT Format Dialog */}
      <Dialog open={showKotFormatDialog} onOpenChange={setShowKotFormatDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>KOT Format Settings</DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="printKotTableNumber" className="cursor-pointer">Print Table Number</Label>
                <Switch 
                  id="printKotTableNumber" 
                  checked={printKotTableNumber} 
                  onCheckedChange={setPrintKotTableNumber} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="printKotTime" className="cursor-pointer">Print Time</Label>
                <Switch 
                  id="printKotTime" 
                  checked={printKotTime} 
                  onCheckedChange={setPrintKotTime} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="printKotServername" className="cursor-pointer">Print Server Name</Label>
                <Switch 
                  id="printKotServername" 
                  checked={printKotServername} 
                  onCheckedChange={setPrintKotServername} 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="kotFooter">Footer Message</Label>
              <Textarea 
                id="kotFooter" 
                value={kotFooterMessage} 
                onChange={(e) => setKotFooterMessage(e.target.value)}
                placeholder="Optional note at the bottom of KOT"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowKotFormatDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveKotSettings}
              className="ml-2"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PrintSettings;
