
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { LogIn, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { checkSupabaseConnection } from '@/integrations/supabase/client';

interface StaffLoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const StaffLoginDialog = ({ open, onOpenChange }: StaffLoginDialogProps) => {
  const { staffMembers, staffLogin, isLoading } = useAuth();
  const { toast } = useToast();
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null);

  // Check Supabase connection when the dialog opens
  useEffect(() => {
    if (open) {
      const checkConnection = async () => {
        const status = await checkSupabaseConnection();
        setConnectionStatus(status);
        
        if (!status) {
          setLoginError("Cannot connect to the database. Please try again later.");
        }
      };
      
      checkConnection();
    }
  }, [open]);

  const handleLogin = async () => {
    setLoginError('');
    
    if (!selectedStaffId) {
      setLoginError("Please select a staff member");
      return;
    }

    if (!password) {
      setLoginError("Please enter your password");
      return;
    }

    const selectedStaff = staffMembers.find(staff => staff.id === selectedStaffId);
    
    if (!selectedStaff) {
      setLoginError("Invalid staff selection");
      return;
    }

    console.log("Attempting login for:", selectedStaff.name, "with password:", password);

    try {
      const result = await staffLogin(selectedStaff.name, password);
      if (result.success) {
        toast({
          title: "Login Successful",
          description: `Welcome back, ${selectedStaff.name}!`,
          duration: 2000,
        });
        onOpenChange(false);
      } else {
        console.error("Login error:", result.error);
        setLoginError(result.error || "Invalid credentials");
      }
    } catch (error) {
      console.error("Staff login error:", error);
      setLoginError("An unexpected error occurred. Please try again.");
    }
  };

  // For demo accounts
  const demoAccounts = [
    { name: "Owner Demo", id: "demo-owner", role: "owner", password: "owner123" },
    { name: "Staff Demo", id: "demo-staff", role: "staff", password: "staff123" }
  ];

  const handleDemoLogin = async (demoId: string) => {
    const demoAccount = demoAccounts.find(account => account.id === demoId);
    if (!demoAccount) return;
    
    try {
      console.log("Attempting demo login for:", demoAccount.name);
      const result = await staffLogin(demoAccount.name, demoAccount.password);
      
      if (result.success) {
        toast({
          title: "Demo Login Successful",
          description: `Welcome to the demo as ${demoAccount.role}!`,
          duration: 2000,
        });
        onOpenChange(false);
      } else {
        console.error("Demo login error:", result.error);
        setLoginError(`Demo login failed: ${result.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Demo login error:", error);
      setLoginError("An unexpected error occurred with the demo login.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Staff Login</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {loginError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{loginError}</AlertDescription>
            </Alert>
          )}
          
          {connectionStatus === false && (
            <Alert variant="warning">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Database connection issues detected. Some features may not work properly.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="staff-select">Select Your Name</Label>
            <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
              <SelectTrigger>
                <SelectValue placeholder="Select staff member" />
              </SelectTrigger>
              <SelectContent>
                {staffMembers.map((staff) => (
                  <SelectItem key={staff.id} value={staff.id}>
                    {staff.name} ({staff.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleLogin();
                }
              }}
            />
          </div>
          
          <Button 
            className="w-full" 
            onClick={handleLogin}
            disabled={isLoading}
          >
            <LogIn className="mr-2 h-4 w-4" />
            {isLoading ? "Logging in..." : "Login"}
          </Button>
          
          <div className="pt-4 border-t">
            <p className="text-sm text-gray-500 mb-2">Quick Demo Access:</p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1" 
                onClick={() => handleDemoLogin("demo-owner")}
              >
                Owner Demo
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1" 
                onClick={() => handleDemoLogin("demo-staff")}
              >
                Staff Demo
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StaffLoginDialog;
