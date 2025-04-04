
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { LogIn } from 'lucide-react';

interface StaffLoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const StaffLoginDialog = ({ open, onOpenChange }: StaffLoginDialogProps) => {
  const { staffMembers, staffLogin, isLoading } = useAuth();
  const { toast } = useToast();
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!selectedStaffId) {
      toast({
        title: "Error",
        description: "Please select a staff member",
        variant: "destructive",
        duration: 1000,
      });
      return;
    }

    if (!password) {
      toast({
        title: "Error",
        description: "Please enter your password",
        variant: "destructive",
        duration: 1000,
      });
      return;
    }

    const selectedStaff = staffMembers.find(staff => staff.id === selectedStaffId);
    
    if (!selectedStaff) {
      toast({
        title: "Error",
        description: "Invalid staff selection",
        variant: "destructive",
        duration: 1000,
      });
      return;
    }

    const result = await staffLogin(selectedStaff.name, password);
    if (result.success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Staff Login</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StaffLoginDialog;
