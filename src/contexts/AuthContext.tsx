
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, Session } from '@supabase/supabase-js';

// User role type
export type UserRole = 'owner' | 'staff';

// User interface
export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
}

// Staff member interface
export interface StaffMember {
  id: string;
  name: string;
  role: UserRole;
  password?: string; // Added for staff login
}

// Auth context type
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  currentUser: AuthUser | null;
  staffMembers: StaffMember[];
  isOwner: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  staffLogin: (name: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  hasPermission: (requiredRole: UserRole) => boolean;
  addStaffMember: (name: string, role: UserRole, password?: string) => void;
  updateStaffMember: (id: string, name: string, role: UserRole, password?: string) => void;
  deleteStaffMember: (id: string) => boolean;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// For testing/development, we'll have sample users
const sampleUsers = [
  {
    id: '1',
    email: 'owner@mircafe.com',
    password: 'owner123',
    name: 'Café Owner',
    role: 'owner' as UserRole,
  },
  {
    id: '2',
    email: 'staff@mircafe.com',
    password: 'staff123',
    name: 'Café Staff',
    role: 'staff' as UserRole,
  },
];

// Default staff members for demo purposes
const defaultStaffMembers: StaffMember[] = [
  {
    id: '1',
    name: 'Café Owner',
    role: 'owner',
    password: 'owner123',
  },
  {
    id: '2',
    name: 'Café Staff',
    role: 'staff',
    password: 'staff123',
  },
  {
    id: '3',
    name: 'John Barista',
    role: 'staff',
    password: 'john123',
  },
  {
    id: '4',
    name: 'Mary Server',
    role: 'staff',
    password: 'mary123',
  }
];

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(defaultStaffMembers);
  const [session, setSession] = useState<Session | null>(null);
  
  // We need to get the toast from a hook inside the component function
  const { toast } = useToast();

  // Computed property for owner status
  const isOwner = currentUser?.role === 'owner';

  // Initialize: check if user is already logged in
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        setIsAuthenticated(!!newSession);
        if (newSession?.user) {
          // For simplicity in testing, we're setting a mock user
          // In production, we'd fetch user data from the database
          setTimeout(() => {
            fetchUserProfile(newSession.user.id);
          }, 0);
        } else {
          setCurrentUser(null);
        }
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setIsAuthenticated(!!existingSession);
      if (existingSession?.user) {
        fetchUserProfile(existingSession.user.id);
      }
      setIsLoading(false);
    });

    // Fetch staff members
    fetchStaffMembers();

    // Check for stored staff login
    const storedStaff = localStorage.getItem('mirCafeStaffLogin');
    if (storedStaff) {
      try {
        const staffData = JSON.parse(storedStaff);
        setCurrentUser({
          id: staffData.id,
          name: staffData.name,
          role: staffData.role,
        });
        setIsAuthenticated(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Error parsing stored staff login:', error);
        localStorage.removeItem('mirCafeStaffLogin');
      }
    }

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user profile from staff table
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('id, name, role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        // For development/demo, use a mock user
        const mockUser = sampleUsers.find(user => user.id === userId);
        if (mockUser) {
          setCurrentUser({
            id: mockUser.id,
            name: mockUser.name,
            role: mockUser.role,
          });
        }
        return;
      }

      if (data) {
        setCurrentUser({
          id: data.id,
          name: data.name,
          role: data.role as UserRole,
        });
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  // Fetch all staff members
  const fetchStaffMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('id, name, role, password')
        .order('name');

      if (error) {
        console.error('Error fetching staff members:', error);
        // Use default staff members for demo
        return;
      }

      if (data && data.length > 0) {
        setStaffMembers(data as StaffMember[]);
      }
    } catch (error) {
      console.error('Error in fetchStaffMembers:', error);
    }
  };

  // Staff login function - uses name and password
  const staffLogin = async (name: string, password: string) => {
    try {
      setIsLoading(true);

      // Find staff member by name and password
      const staffMember = staffMembers.find(
        (staff) => staff.name === name && staff.password === password
      );

      if (!staffMember) {
        throw new Error('Invalid name or password');
      }

      // Store staff login in localStorage
      localStorage.setItem('mirCafeStaffLogin', JSON.stringify(staffMember));

      // Set authentication state
      setIsAuthenticated(true);
      setCurrentUser({
        id: staffMember.id,
        name: staffMember.name,
        role: staffMember.role,
      });

      // Create attendance record
      try {
        const { error } = await supabase
          .from('attendance')
          .insert({
            staff_id: staffMember.id,
            date: new Date().toISOString().split('T')[0],
            check_in_time: new Date().toISOString(),
          });

        if (error) {
          console.error('Error creating attendance record:', error);
        }
      } catch (error) {
        console.error('Error creating attendance record:', error);
      }

      // Show success toast
      toast({
        title: "Logged in successfully",
        description: `Welcome back, ${staffMember.name}!`,
        duration: 1000,
      });

      return { success: true };
    } catch (error) {
      console.error('Staff login error:', error);
      toast({
        title: "Login failed",
        description: error.message || "Invalid name or password",
        variant: "destructive",
        duration: 1000,
      });
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Login function for Supabase auth
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      // For development/demo, check against sample users
      const user = sampleUsers.find(
        (u) => u.email === email && u.password === password
      );

      if (!user) {
        // Attempt Supabase auth if sample user not found
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw error;
        }

        if (data.user) {
          // Use setTimeout to avoid deadlock with onAuthStateChange
          setTimeout(() => {
            fetchUserProfile(data.user.id);
          }, 0);
        }

        return { success: true };
      }

      // If using sample user for testing
      setIsAuthenticated(true);
      setCurrentUser({
        id: user.id,
        name: user.name,
        role: user.role,
      });

      // Show success toast
      toast({
        title: "Logged in successfully",
        description: `Welcome back, ${user.name}!`,
        duration: 1000,
      });

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
        duration: 1000,
      });
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Create attendance checkout record if using staff login
      if (currentUser && localStorage.getItem('mirCafeStaffLogin')) {
        try {
          // Find the latest check-in without a check-out
          const { data, error } = await supabase
            .from('attendance')
            .select('id')
            .eq('staff_id', currentUser.id)
            .eq('date', new Date().toISOString().split('T')[0])
            .is('check_out_time', null)
            .order('check_in_time', { ascending: false })
            .limit(1);

          if (error) {
            console.error('Error finding attendance record:', error);
          } else if (data && data.length > 0) {
            // Update the record with checkout time
            const { error: updateError } = await supabase
              .from('attendance')
              .update({
                check_out_time: new Date().toISOString(),
              })
              .eq('id', data[0].id);

            if (updateError) {
              console.error('Error updating attendance record:', updateError);
            }
          }
        } catch (error) {
          console.error('Error handling checkout:', error);
        }

        // Clear staff login from localStorage
        localStorage.removeItem('mirCafeStaffLogin');
      }
      
      // If using Supabase auth
      if (session) {
        await supabase.auth.signOut();
      }
      
      // Reset state
      setIsAuthenticated(false);
      setCurrentUser(null);
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
        duration: 1000,
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
        duration: 1000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check user permissions
  const hasPermission = (requiredRole: UserRole) => {
    if (!currentUser) return false;
    
    // Owner has access to everything
    if (currentUser.role === 'owner') return true;
    
    // Staff has limited access
    return currentUser.role === requiredRole;
  };

  // Staff management functions
  const addStaffMember = (name: string, role: UserRole, password?: string) => {
    // In a real app, you would save to the database here
    const newStaff: StaffMember = {
      id: `temp-${Date.now()}`, // In real app, this would be generated by the database
      name,
      role,
      password: password || '',
    };
    
    setStaffMembers([...staffMembers, newStaff]);
    
    // Here you would make the API call to save to Supabase
    // and then update the local state with the returned data
  };

  const updateStaffMember = (id: string, name: string, role: UserRole, password?: string) => {
    // In a real app, you would update the database here
    setStaffMembers(
      staffMembers.map(staff =>
        staff.id === id 
          ? { 
              ...staff, 
              name, 
              role, 
              ...(password ? { password } : {})
            } 
          : staff
      )
    );
    
    // Here you would make the API call to update in Supabase
  };

  const deleteStaffMember = (id: string) => {
    // Cannot delete the owner or current user
    const staffToDelete = staffMembers.find(staff => staff.id === id);
    
    if (!staffToDelete || staffToDelete.role === 'owner' || currentUser?.id === id) {
      return false;
    }
    
    // In a real app, you would delete from the database here
    setStaffMembers(staffMembers.filter(staff => staff.id !== id));
    
    // Here you would make the API call to delete from Supabase
    return true;
  };

  // Context value
  const value = {
    isAuthenticated,
    isLoading,
    currentUser,
    staffMembers,
    isOwner,
    login,
    staffLogin,
    logout,
    hasPermission,
    addStaffMember,
    updateStaffMember,
    deleteStaffMember,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
