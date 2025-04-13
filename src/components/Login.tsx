
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Login = () => {
  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStaffLoginOpen, setIsStaffLoginOpen] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [resetError, setResetError] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Signup state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [signupError, setSignupError] = useState('');
  
  const { login, addStaffMember } = useAuth();
  const { toast } = useToast();

  // Reset password form schema
  const resetPasswordSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address" }),
  });

  const resetPasswordForm = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

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

    // Check for password reset confirmation
    const handlePasswordReset = async () => {
      const hash = window.location.hash;
      if (hash && hash.includes('#access_token=')) {
        try {
          // Extract the access token from the URL
          const accessToken = hash.split('#access_token=')[1].split('&')[0];
          
          // If we have a token, show a message to the user
          if (accessToken) {
            toast({
              title: "Password Reset Link Detected",
              description: "Please set your new password",
              duration: 3000,
            });
            
            // You can redirect to a password update form or show a modal here
            // For now, we'll just notify the user
          }
        } catch (error) {
          console.error('Error processing reset link:', error);
        }
      }
    };

    checkSession();
    handlePasswordReset();
  }, [toast]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');
    
    try {
      console.log("Attempting email login with:", email);
      
      // First try email login with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("Supabase auth error:", error);
        
        // If Supabase auth fails, try the demo accounts
        if (email === 'owner@mircafe.com' && password === 'owner123') {
          // Use the login function for owner demo
          const result = await login(email, password);
          if (result.success) {
            toast({
              title: "Demo Login Successful",
              description: "Welcome to the owner demo!",
              duration: 1000,
            });
            return;
          }
        } else if (email === 'staff@mircafe.com' && password === 'staff123') {
          // Use the login function for staff demo
          const result = await login(email, password);
          if (result.success) {
            toast({
              title: "Demo Login Successful",
              description: "Welcome to the staff demo!",
              duration: 1000,
            });
            return;
          }
        }
        
        // If all login attempts fail, show error
        setLoginError(error.message || "Invalid credentials");
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
      setLoginError("An unexpected error occurred. Please try again.");
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
    setSignupError('');
    
    // Validation
    if (!signupName || !signupEmail || !signupPassword) {
      setSignupError("Please fill in all fields");
      setIsSigningUp(false);
      return;
    }
    
    if (signupPassword !== signupConfirmPassword) {
      setSignupError("Passwords do not match");
      setIsSigningUp(false);
      return;
    }
    
    try {
      // Create a Supabase auth account
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
        description: "Your account has been created successfully. Please check your email for verification.",
        duration: 5000,
      });
      
      // Reset signup form and switch to login tab
      setSignupName('');
      setSignupEmail('');
      setSignupPassword('');
      setSignupConfirmPassword('');
    } catch (error) {
      console.error('Signup error:', error);
      setSignupError(error.message || "An error occurred while creating your account");
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleResetPassword = async (values: z.infer<typeof resetPasswordSchema>) => {
    setResetError('');
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        setResetError(error.message);
      } else {
        setResetEmailSent(true);
        toast({
          title: "Password Reset Email Sent",
          description: "Please check your email for the password reset link",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setResetError("An unexpected error occurred");
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
                {loginError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{loginError}</AlertDescription>
                  </Alert>
                )}
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
                <div className="text-right">
                  <Button 
                    variant="link" 
                    type="button" 
                    className="px-0 text-sm text-mir-red"
                    onClick={() => setResetPasswordOpen(true)}
                  >
                    Forgot password?
                  </Button>
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
                {signupError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{signupError}</AlertDescription>
                  </Alert>
                )}
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

      {/* Reset Password Dialog */}
      <Dialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>
          
          {resetEmailSent ? (
            <div className="space-y-4 py-3">
              <Alert>
                <AlertDescription>
                  Password reset link has been sent to your email address. Please check your inbox.
                </AlertDescription>
              </Alert>
              <Button 
                className="w-full" 
                onClick={() => {
                  setResetPasswordOpen(false);
                  setResetEmailSent(false);
                  resetPasswordForm.reset();
                }}
              >
                Return to Login
              </Button>
            </div>
          ) : (
            <Form {...resetPasswordForm}>
              <form onSubmit={resetPasswordForm.handleSubmit(handleResetPassword)} className="space-y-4">
                {resetError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{resetError}</AlertDescription>
                  </Alert>
                )}
                <FormField
                  control={resetPasswordForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your email" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button type="submit">Send Reset Link</Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
