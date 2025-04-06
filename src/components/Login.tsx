
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import StaffLoginDialog from './Login/StaffLoginDialog';

const Login = () => {
  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStaffLoginOpen, setIsStaffLoginOpen] = useState(false);
  
  // Signup state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  
  const { login, addStaffMember } = useAuth();
  const { toast } = useToast();

  // Check for auth in URL (for when redirected back after email confirmation)
  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (data?.session) {
        toast({
          title: "Already logged in",
          description: "You're already signed in",
          duration: 1000,
        });
      }
    };

    checkSession();
  }, [toast]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // First try email login with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        toast({
          title: "Login Failed",
          description: error.message || "Please check your credentials and try again",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login Successful",
          description: "Welcome back!",
          duration: 1000,
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningUp(true);
    
    // Validation
    if (!signupName || !signupEmail || !signupPassword) {
      toast({
        title: "Signup Failed",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      setIsSigningUp(false);
      return;
    }
    
    if (signupPassword !== signupConfirmPassword) {
      toast({
        title: "Signup Failed",
        description: "Passwords do not match",
        variant: "destructive",
      });
      setIsSigningUp(false);
      return;
    }
    
    try {
      // Create a Supabase auth account with autoconfirm
      const { data, error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          data: {
            name: signupName,
            role: 'owner',
          },
          emailRedirectTo: window.location.origin
        }
      });

      if (error) {
        throw error;
      }
      
      // Add the staff member to our local staff list
      addStaffMember(signupName, 'owner', signupPassword);
      
      toast({
        title: "Account Created",
        description: "Your account has been created successfully. You can now log in.",
        duration: 3000,
      });
      
      // Reset signup form and switch to login tab
      setSignupName('');
      setSignupEmail('');
      setSignupPassword('');
      setSignupConfirmPassword('');
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: "Signup Failed",
        description: "An error occurred while creating your account",
        variant: "destructive",
      });
    } finally {
      setIsSigningUp(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-mir-gray-light p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-mir-black">Mir Café</CardTitle>
          <CardDescription>Access the café management system</CardDescription>
        </CardHeader>
        
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleEmailLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="text-sm text-gray-500">
                  <p>Demo Accounts:</p>
                  <p>Owner: owner@mircafe.com / owner123</p>
                  <p>Staff: staff@mircafe.com / staff123</p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <Button className="w-full bg-mir-red hover:bg-mir-red/90" type="submit" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign In as Owner'}
                </Button>
                <Button 
                  className="w-full" 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsStaffLoginOpen(true)}
                >
                  Staff Login
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="signup">
            <form onSubmit={handleSignup}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input 
                    id="signup-name" 
                    type="text" 
                    placeholder="Enter your full name"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input 
                    id="signup-email" 
                    type="email" 
                    placeholder="Enter your email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input 
                    id="signup-password" 
                    type="password" 
                    placeholder="Create a password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                  <Input 
                    id="signup-confirm-password" 
                    type="password" 
                    placeholder="Confirm your password"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-mir-red hover:bg-mir-red/90" type="submit" disabled={isSigningUp}>
                  {isSigningUp ? 'Creating Account...' : 'Sign Up as Owner'}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Staff Login Dialog */}
      <StaffLoginDialog 
        open={isStaffLoginOpen} 
        onOpenChange={setIsStaffLoginOpen} 
      />
    </div>
  );
};

export default Login;
