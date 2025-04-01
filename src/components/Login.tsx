
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth, staffMembers, UserRole } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Coffee } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('staff');

  const handleLogin = () => {
    if (!selectedUser) {
      toast({
        title: 'Error',
        description: 'Please select a user to login',
        variant: 'destructive',
      });
      return;
    }

    const success = login(selectedUser, selectedRole);
    
    if (success) {
      toast({
        title: 'Success',
        description: `Logged in as ${selectedUser}`,
      });
    } else {
      toast({
        title: 'Error',
        description: 'Invalid user or role',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-mir-gray-light p-4">
      <Card className="w-full max-w-md shadow-lg border-mir-gray animate-fade-in">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center">
            <Coffee size={48} className="text-mir-red" />
          </div>
          <CardTitle className="text-2xl font-bold text-mir-black">Mir Café Hub</CardTitle>
          <CardDescription>Select your name to continue</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-mir-black">Select Your Name</label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select name" />
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
            <label className="text-sm font-medium text-mir-black">Select Role</label>
            <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full bg-mir-red hover:bg-mir-red/90 text-white" 
            onClick={handleLogin}
          >
            Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
