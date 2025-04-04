
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface OwnerConfig {
  id: string;
  whatsapp_api_key: string | null;
  upi_qr_code_url: string | null;
}

const SettingsPage = () => {
  const [whatsappApiKey, setWhatsappApiKey] = useState('');
  const [upiQrUrl, setUpiQrUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  const navigate = useNavigate();

  // Check if user has permission to access this page
  useEffect(() => {
    if (!hasPermission('owner')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access settings",
        variant: "destructive",
      });
      navigate('/pos');
    }
  }, [hasPermission, navigate, toast]);

  // Load existing configuration
  useEffect(() => {
    const fetchConfig = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('owner_config')
          .select('*')
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          throw error;
        }

        if (data) {
          setWhatsappApiKey(data.whatsapp_api_key || '');
          setUpiQrUrl(data.upi_qr_code_url || '');
        }
      } catch (error) {
        console.error('Error loading config:', error);
        toast({
          title: "Error",
          description: "Failed to load settings",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, [toast]);

  // Save configuration
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Check if we already have a config record
      const { data: existingConfig, error: checkError } = await supabase
        .from('owner_config')
        .select('id')
        .limit(1);
      
      if (checkError) throw checkError;
      
      let result;
      if (existingConfig && existingConfig.length > 0) {
        // Update existing config
        result = await supabase
          .from('owner_config')
          .update({
            whatsapp_api_key: whatsappApiKey,
            upi_qr_code_url: upiQrUrl,
          })
          .eq('id', existingConfig[0].id);
      } else {
        // Insert new config
        result = await supabase
          .from('owner_config')
          .insert({
            whatsapp_api_key: whatsappApiKey,
            upi_qr_code_url: upiQrUrl,
          });
      }

      if (result.error) throw result.error;
      
      toast({
        title: "Settings Saved",
        description: "Your configuration has been updated",
      });
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle file upload for UPI QR
  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // TODO: Implement file upload to storage
      // For now, we'll use a placeholder URL
      setUpiQrUrl(`https://example.com/${file.name}`);
      
      toast({
        title: "QR Code Added",
        description: "Your QR code has been uploaded",
      });
    } catch (error) {
      console.error('Error uploading QR:', error);
      toast({
        title: "Error",
        description: "Failed to upload QR code",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout title="Settings" showBackButton>
      <div className="mir-container">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Owner Settings</CardTitle>
            <CardDescription>Configure system settings for your café</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              <div className="flex justify-center py-4">
                <p>Loading settings...</p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp-api">WhatsApp API Key</Label>
                  <Input 
                    id="whatsapp-api" 
                    value={whatsappApiKey}
                    onChange={(e) => setWhatsappApiKey(e.target.value)}
                    placeholder="Enter your WhatsApp Business API key"
                  />
                  <p className="text-xs text-muted-foreground">
                    This key will be used to send order receipts to customers via WhatsApp
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="upi-qr">UPI QR Code</Label>
                  <div className="flex items-center gap-4">
                    <Input 
                      id="upi-qr-url" 
                      value={upiQrUrl}
                      onChange={(e) => setUpiQrUrl(e.target.value)}
                      placeholder="Enter URL or upload image"
                      className="flex-1"
                    />
                    <div className="relative">
                      <Button type="button" variant="outline">
                        Upload
                      </Button>
                      <Input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleQrUpload}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This QR code will be displayed when a customer pays via UPI
                  </p>
                  
                  {upiQrUrl && (
                    <div className="mt-2 border rounded-md p-4 max-w-[200px] mx-auto">
                      <img 
                        src={upiQrUrl} 
                        alt="UPI QR Code" 
                        className="w-full h-auto"
                        onError={(e) => {
                          e.currentTarget.src = "https://via.placeholder.com/200?text=QR+Code+Preview";
                        }}
                      />
                    </div>
                  )}
                </div>
                
                <Button 
                  className="w-full mt-4 bg-mir-yellow text-mir-black hover:bg-mir-yellow/90"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Settings'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SettingsPage;
