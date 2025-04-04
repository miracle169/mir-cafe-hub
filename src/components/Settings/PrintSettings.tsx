
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { FileUpload, QrCode, Save, Printer } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const PrintSettings = ({ isOwner = false }) => {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  
  // Bill Format Settings
  const [billSettings, setBillSettings] = useState({
    printLogo: true,
    printAddress: true,
    printCustomerInfo: true,
    printItemizedDetails: true,
    printTaxDetails: true,
    printDiscountDetails: true,
    footerMessage: "Thank you for visiting our cafe! We hope to see you again soon!"
  });
  
  // KOT Format Settings
  const [kotSettings, setKotSettings] = useState({
    printTableNumber: true,
    printTime: true,
    printServername: true,
    footerMessage: ""
  });
  
  // Logo and QR settings
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [qrCodeFile, setQrCodeFile] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  
  // WhatsApp API settings
  const [whatsappApiKey, setWhatsappApiKey] = useState('');
  
  // Load settings from localStorage on mount
  useEffect(() => {
    // Load bill settings
    const savedBillSettings = localStorage.getItem('mirCafePrintSettings');
    if (savedBillSettings) {
      try {
        const parsed = JSON.parse(savedBillSettings);
        setBillSettings(parsed.bill || billSettings);
      } catch (error) {
        console.error('Error parsing bill settings:', error);
      }
    }
    
    // Load KOT settings
    const savedKotSettings = localStorage.getItem('mirCafeKotSettings');
    if (savedKotSettings) {
      try {
        const parsed = JSON.parse(savedKotSettings);
        setKotSettings(parsed.kot || kotSettings);
      } catch (error) {
        console.error('Error parsing KOT settings:', error);
      }
    }
    
    // Load owner configuration from Supabase
    fetchOwnerConfig();
  }, []);
  
  // Fetch owner config from Supabase
  const fetchOwnerConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('owner_config')
        .select('*')
        .limit(1)
        .single();
        
      if (error) {
        console.error('Error fetching owner config:', error);
        return;
      }
      
      if (data) {
        setWhatsappApiKey(data.whatsapp_api_key || '');
        setLogoUrl(data.logo_url || '');
        setQrCodeUrl(data.upi_qr_code_url || '');
      }
    } catch (error) {
      console.error('Error in fetchOwnerConfig:', error);
    }
  };
  
  // Handle save print settings
  const handleSavePrintSettings = () => {
    // Save bill settings
    localStorage.setItem('mirCafePrintSettings', JSON.stringify({ bill: billSettings }));
    
    // Save KOT settings
    localStorage.setItem('mirCafeKotSettings', JSON.stringify({ kot: kotSettings }));
    
    toast({
      title: "Settings Saved",
      description: "Your print settings have been saved",
      duration: 1000,
    });
  };
  
  // Handle logo file change
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };
  
  // Handle QR code file change
  const handleQrCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setQrCodeFile(e.target.files[0]);
    }
  };
  
  // Handle upload files
  const handleUploadFiles = async () => {
    if (!isOwner) {
      toast({
        title: "Permission Denied",
        description: "Only owners can upload files",
        variant: "destructive",
        duration: 1000,
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      let newLogoUrl = logoUrl;
      let newQrCodeUrl = qrCodeUrl;
      
      // Upload logo if selected
      if (logoFile) {
        const { data: logoData, error: logoError } = await supabase.storage
          .from('cafe-assets')
          .upload(`logos/${Date.now()}_${logoFile.name}`, logoFile, {
            cacheControl: '3600',
            upsert: true
          });
          
        if (logoError) {
          throw new Error(`Logo upload failed: ${logoError.message}`);
        }
        
        // Get public URL
        const { data: logoPublicUrl } = supabase.storage
          .from('cafe-assets')
          .getPublicUrl(logoData.path);
          
        newLogoUrl = logoPublicUrl.publicUrl;
      }
      
      // Upload QR code if selected
      if (qrCodeFile) {
        const { data: qrData, error: qrError } = await supabase.storage
          .from('cafe-assets')
          .upload(`qrcodes/${Date.now()}_${qrCodeFile.name}`, qrCodeFile, {
            cacheControl: '3600',
            upsert: true
          });
          
        if (qrError) {
          throw new Error(`QR code upload failed: ${qrError.message}`);
        }
        
        // Get public URL
        const { data: qrPublicUrl } = supabase.storage
          .from('cafe-assets')
          .getPublicUrl(qrData.path);
          
        newQrCodeUrl = qrPublicUrl.publicUrl;
      }
      
      // Update owner_config table
      const { error: updateError } = await supabase
        .from('owner_config')
        .update({
          logo_url: newLogoUrl,
          upi_qr_code_url: newQrCodeUrl,
          whatsapp_api_key: whatsappApiKey,
        })
        .eq('id', '1');
        
      if (updateError) {
        // If record doesn't exist, insert it
        const { error: insertError } = await supabase
          .from('owner_config')
          .insert({
            logo_url: newLogoUrl,
            upi_qr_code_url: newQrCodeUrl,
            whatsapp_api_key: whatsappApiKey,
          });
          
        if (insertError) {
          throw insertError;
        }
      }
      
      // Update state
      setLogoUrl(newLogoUrl);
      setQrCodeUrl(newQrCodeUrl);
      
      toast({
        title: "Upload Successful",
        description: "Files have been uploaded and settings saved",
        duration: 1000,
      });
      
      // Reset file inputs
      setLogoFile(null);
      setQrCodeFile(null);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload files",
        variant: "destructive",
        duration: 1000,
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  // Handle save WhatsApp API key
  const handleSaveApiKey = async () => {
    if (!isOwner) {
      toast({
        title: "Permission Denied",
        description: "Only owners can update API keys",
        variant: "destructive",
        duration: 1000,
      });
      return;
    }
    
    try {
      // Update owner_config table
      const { error: updateError } = await supabase
        .from('owner_config')
        .update({
          whatsapp_api_key: whatsappApiKey,
        })
        .eq('id', '1');
        
      if (updateError) {
        // If record doesn't exist, insert it
        const { error: insertError } = await supabase
          .from('owner_config')
          .insert({
            whatsapp_api_key: whatsappApiKey,
          });
          
        if (insertError) {
          throw insertError;
        }
      }
      
      toast({
        title: "API Key Saved",
        description: "WhatsApp API key has been updated",
        duration: 1000,
      });
    } catch (error) {
      console.error('API key update error:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update API key",
        variant: "destructive",
        duration: 1000,
      });
    }
  };
  
  return (
    <Tabs defaultValue="bill">
      <TabsList className="grid grid-cols-3 mb-4">
        <TabsTrigger value="bill">Bill Format</TabsTrigger>
        <TabsTrigger value="kot">KOT Format</TabsTrigger>
        <TabsTrigger value="assets">Cafe Assets</TabsTrigger>
      </TabsList>
      
      <TabsContent value="bill">
        <Card>
          <CardHeader>
            <CardTitle>Bill Format Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="print-logo" className="cursor-pointer">Print Logo</Label>
              <Switch 
                id="print-logo" 
                checked={billSettings.printLogo}
                onCheckedChange={(checked) => setBillSettings({...billSettings, printLogo: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="print-address" className="cursor-pointer">Print Cafe Address</Label>
              <Switch 
                id="print-address" 
                checked={billSettings.printAddress}
                onCheckedChange={(checked) => setBillSettings({...billSettings, printAddress: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="print-customer" className="cursor-pointer">Print Customer Information</Label>
              <Switch 
                id="print-customer" 
                checked={billSettings.printCustomerInfo}
                onCheckedChange={(checked) => setBillSettings({...billSettings, printCustomerInfo: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="print-itemized" className="cursor-pointer">Print Itemized Details</Label>
              <Switch 
                id="print-itemized" 
                checked={billSettings.printItemizedDetails}
                onCheckedChange={(checked) => setBillSettings({...billSettings, printItemizedDetails: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="print-tax" className="cursor-pointer">Print Tax Details</Label>
              <Switch 
                id="print-tax" 
                checked={billSettings.printTaxDetails}
                onCheckedChange={(checked) => setBillSettings({...billSettings, printTaxDetails: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="print-discount" className="cursor-pointer">Print Discount Details</Label>
              <Switch 
                id="print-discount" 
                checked={billSettings.printDiscountDetails}
                onCheckedChange={(checked) => setBillSettings({...billSettings, printDiscountDetails: checked})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="footer-message">Footer Message</Label>
              <Input 
                id="footer-message" 
                value={billSettings.footerMessage}
                onChange={(e) => setBillSettings({...billSettings, footerMessage: e.target.value})}
              />
            </div>
            
            <Button onClick={handleSavePrintSettings}>
              <Save className="mr-2 h-4 w-4" />
              Save Bill Settings
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="kot">
        <Card>
          <CardHeader>
            <CardTitle>Kitchen Order Ticket Format</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="print-table" className="cursor-pointer">Print Table Number</Label>
              <Switch 
                id="print-table" 
                checked={kotSettings.printTableNumber}
                onCheckedChange={(checked) => setKotSettings({...kotSettings, printTableNumber: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="print-time" className="cursor-pointer">Print Date and Time</Label>
              <Switch 
                id="print-time" 
                checked={kotSettings.printTime}
                onCheckedChange={(checked) => setKotSettings({...kotSettings, printTime: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="print-server" className="cursor-pointer">Print Server Name</Label>
              <Switch 
                id="print-server" 
                checked={kotSettings.printServername}
                onCheckedChange={(checked) => setKotSettings({...kotSettings, printServername: checked})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="kot-footer">Footer Message</Label>
              <Input 
                id="kot-footer" 
                value={kotSettings.footerMessage}
                onChange={(e) => setKotSettings({...kotSettings, footerMessage: e.target.value})}
              />
            </div>
            
            <Button onClick={handleSavePrintSettings}>
              <Printer className="mr-2 h-4 w-4" />
              Save KOT Settings
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="assets">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Cafe Logo & UPI QR Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <Label>Cafe Logo</Label>
                {logoUrl && (
                  <div className="mb-2">
                    <img 
                      src={logoUrl} 
                      alt="Cafe Logo" 
                      className="max-h-40 object-contain border rounded p-2" 
                    />
                  </div>
                )}
                <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleLogoChange}
                  disabled={!isOwner}
                />
                <p className="text-xs text-gray-500">This logo will appear on printed bills and receipts</p>
              </div>
              
              <div className="flex-1 space-y-4">
                <Label>UPI QR Code</Label>
                {qrCodeUrl && (
                  <div className="mb-2">
                    <img 
                      src={qrCodeUrl} 
                      alt="UPI QR Code" 
                      className="max-h-40 object-contain border rounded p-2" 
                    />
                  </div>
                )}
                <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleQrCodeChange}
                  disabled={!isOwner}
                />
                <p className="text-xs text-gray-500">This QR code will be used for UPI payments</p>
              </div>
            </div>
            
            {isOwner && (
              <Button 
                onClick={handleUploadFiles} 
                disabled={isUploading || (!logoFile && !qrCodeFile)}
              >
                <FileUpload className="mr-2 h-4 w-4" />
                {isUploading ? "Uploading..." : "Upload Files"}
              </Button>
            )}
          </CardContent>
        </Card>
        
        {isOwner && (
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp Integration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="whatsapp-api">WhatsApp API Key</Label>
                <Input 
                  id="whatsapp-api" 
                  value={whatsappApiKey}
                  onChange={(e) => setWhatsappApiKey(e.target.value)}
                  type="password"
                />
                <p className="text-xs text-gray-500">API key used for sending WhatsApp bill notifications to customers</p>
              </div>
              
              <Button onClick={handleSaveApiKey}>
                <Save className="mr-2 h-4 w-4" />
                Save API Key
              </Button>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default PrintSettings;
