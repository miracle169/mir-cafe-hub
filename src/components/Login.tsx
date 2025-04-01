
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Coffee, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Login = () => {
  const { login, staffMembers } = useAuth();
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isOwner, setIsOwner] = useState<boolean>(false);

  // Check if selected user is owner
  useEffect(() => {
    if (selectedUser) {
      const user = staffMembers.find(
        (staff) => staff.name.toLowerCase() === selectedUser.toLowerCase()
      );
      setIsOwner(user?.role === 'owner');
    } else {
      setIsOwner(false);
    }
  }, [selectedUser, staffMembers]);

  const handleLogin = () => {
    if (!selectedUser) {
      toast({
        title: 'Error',
        description: 'Please select a user to login',
        variant: 'destructive',
      });
      return;
    }

    // If owner, require password
    if (isOwner && !password) {
      toast({
        title: 'Error',
        description: 'Please enter the owner password',
        variant: 'destructive',
      });
      return;
    }

    // For debugging
    console.log('Attempting login with:', { 
      user: selectedUser, 
      isOwner, 
      password: isOwner ? password : 'none required'
    });
    
    const success = login(selectedUser, isOwner ? password : undefined);
    
    if (success) {
      toast({
        title: 'Success',
        description: `Logged in as ${selectedUser}`,
      });
    } else {
      toast({
        title: 'Error',
        description: isOwner ? 'Invalid password' : 'Invalid user',
        variant: 'destructive',
      });
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
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
            <Label className="text-sm font-medium text-mir-black">Select Your Name</Label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select name" />
              </SelectTrigger>
              <SelectContent>
                {staffMembers.map((staff) => (
                  <SelectItem key={staff.id} value={staff.name}>
                    {staff.name} {staff.role === 'owner' ? '(Owner)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isOwner && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-mir-black">Owner Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={toggleShowPassword}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {isOwner && (
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertDescription className="text-yellow-800 text-xs">
                Owner login requires password. Default is "admin123"
              </AlertDescription>
            </Alert>
          )}
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
