
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

// Sample user interface (for development/testing only)
interface SampleUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

// Sample users for development/testing
const sampleUsers: SampleUser[] = [
  {
    id: 'sample-owner-1',
    name: 'Sample Owner',
    email: 'owner@example.com',
    password: 'password',
    role: 'owner'
  },
  {
    id: 'sample-staff-1',
    name: 'Sample Staff',
    email: 'staff@example.com',
    password: 'password',
    role: 'staff'
  }
];

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
  addStaffMember: (name: string, role: UserRole, password?: string) => Promise<void>;
  updateStaffMember: (id: string, name: string, role: UserRole, password?: string) => Promise<void>;
  deleteStaffMember: (id: string) => Promise<boolean>;
  checkIn: () => Promise<void>;
  checkOut: () => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
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
        console.log("Auth state changed:", event, newSession?.user?.email);
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
      console.log("Got existing session:", existingSession?.user?.email);
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
      // First check if this is a staff member with a different ID format
      if (userId.indexOf('-') === -1) {
        const staffMember = staffMembers.find(staff => staff.id === userId);
        if (staffMember) {
          setCurrentUser({
            id: staffMember.id,
            name: staffMember.name,
            role: staffMember.role,
          });
          return;
        }
      }
      
      const { data, error } = await supabase
        .from('staff')
        .select('id, name, role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        // Get user metadata from the Supabase user
        try {
          const { data: userData } = await supabase.auth.getUser();
          if (userData?.user?.user_metadata) {
            const { name, role } = userData.user.user_metadata;
            setCurrentUser({
              id: userData.user.id,
              name: name || 'Unknown User',
              role: role || 'owner',
            });
            return;
          }
        } catch (metaError) {
          console.error('Error getting user metadata:', metaError);
        }
        
        // Fallback to sample users for development/demo
        const mockUser = sampleUsers.find(user => user.email.toLowerCase() === userId.toLowerCase());
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
        return;
      }

      if (data && data.length > 0) {
        setStaffMembers(data as StaffMember[]);
      }
    } catch (error) {
      console.error('Error in fetchStaffMembers:', error);
    }
  };

  // Staff login function - uses name/email and password
  const staffLogin = async (nameOrEmail: string, password: string) => {
    try {
      setIsLoading(true);

      // Find staff member by name and password
      const { data, error } = await supabase
        .from('staff')
        .select('id, name, role, password')
        .or(`name.eq.${nameOrEmail},name.ilike.${nameOrEmail}`)
        .single();

      if (error || !data) {
        throw new Error('Staff not found');
      }

      // Check password
      if (data.password !== password) {
        throw new Error('Invalid password');
      }

      // Store staff login in localStorage
      localStorage.setItem('mirCafeStaffLogin', JSON.stringify(data));

      // Set authentication state
      setIsAuthenticated(true);
      setCurrentUser({
        id: data.id,
        name: data.name,
        role: data.role,
      });

      // Show success toast
      toast({
        title: "Logged in successfully",
        description: `Welcome back, ${data.name}!`,
        duration: 1000,
      });

      return { success: true };
    } catch (error) {
      console.error('Staff login error:', error);
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
        duration: 1000,
      });
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Check-in function - creates attendance record
  const checkIn = async () => {
    if (!currentUser) {
      toast({
        title: "Cannot check in",
        description: "You must be logged in to check in",
        variant: "destructive",
        duration: 1000,
      });
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();
      
      // Create attendance record
      const { error } = await supabase
        .from('attendance')
        .insert({
          staff_id: currentUser.id,
          date: today,
          check_in_time: now,
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Checked in",
        description: `You have checked in at ${new Date().toLocaleTimeString()}`,
        duration: 1000,
      });
    } catch (error) {
      console.error('Error creating attendance record:', error);
      toast({
        title: "Check-in failed",
        description: "Failed to record check-in",
        variant: "destructive",
        duration: 1000,
      });
    }
  };

  // Check-out function - updates attendance record
  const checkOut = async () => {
    if (!currentUser) {
      toast({
        title: "Cannot check out",
        description: "You must be logged in to check out",
        variant: "destructive",
        duration: 1000,
      });
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();
      
      // First check if there's an existing check-in for today
      const { data: existingRecord, error: fetchError } = await supabase
        .from('attendance')
        .select('*')
        .eq('staff_id', currentUser.id)
        .eq('date', today)
        .is('check_out_time', null)
        .order('check_in_time', { ascending: false })
        .limit(1);
        
      if (fetchError) {
        throw fetchError;
      }
      
      if (existingRecord && existingRecord.length > 0) {
        // Update existing record with checkout time
        const { error: updateError } = await supabase
          .from('attendance')
          .update({
            check_out_time: now
          })
          .eq('id', existingRecord[0].id);
          
        if (updateError) {
          throw updateError;
        }
      } else {
        // Create new check-out record if no existing record found
        const { error } = await supabase
          .from('attendance')
          .insert({
            staff_id: currentUser.id,
            date: today,
            check_in_time: now,
            check_out_time: now,
          });

        if (error) {
          throw error;
        }
      }

      toast({
        title: "Checked out",
        description: `You have checked out at ${new Date().toLocaleTimeString()}`,
        duration: 1000,
      });
    } catch (error) {
      console.error('Error creating checkout record:', error);
      toast({
        title: "Check-out failed",
        description: "Failed to record check-out",
        variant: "destructive",
        duration: 1000,
      });
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
      
      // If using Supabase auth
      if (session) {
        await supabase.auth.signOut();
      }
      
      // Clear staff login from localStorage
      localStorage.removeItem('mirCafeStaffLogin');
      
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
  const addStaffMember = async (name: string, role: UserRole, password?: string) => {
    try {
      if (!password) {
        throw new Error('Password is required');
      }

      // Check if staff with same name already exists
      const { data: existingStaff, error: checkError } = await supabase
        .from('staff')
        .select('name')
        .ilike('name', name)
        .limit(1);
      
      if (checkError) {
        throw new Error('Error checking for existing staff');
      }
      
      if (existingStaff && existingStaff.length > 0) {
        throw new Error('A staff member with this name already exists');
      }
      
      // Insert the new staff member
      const { data, error } = await supabase
        .from('staff')
        .insert({
          name,
          role,
          password
        })
        .select();

      if (error) {
        throw error;
      }

      // Refresh staff members list
      fetchStaffMembers();
      
      // Add to local state as well for immediate UI update
      if (data && data.length > 0) {
        setStaffMembers([...staffMembers, data[0] as StaffMember]);
      }
    } catch (error) {
      console.error('Error adding staff member:', error);
      toast({
        title: "Error adding staff",
        description: error.message || "Failed to add staff member",
        variant: "destructive",
        duration: 1000,
      });
      throw error;
    }
  };

  const updateStaffMember = async (id: string, name: string, role: UserRole, password?: string) => {
    try {
      // Check if staff with same name already exists (excluding the current staff)
      const { data: existingStaff, error: checkError } = await supabase
        .from('staff')
        .select('name')
        .neq('id', id)
        .ilike('name', name)
        .limit(1);
      
      if (checkError) {
        throw new Error('Error checking for existing staff');
      }
      
      if (existingStaff && existingStaff.length > 0) {
        throw new Error('A staff member with this name already exists');
      }
      
      // Update the staff member
      const updateData: any = { name, role };
      if (password) {
        updateData.password = password;
      }
      
      const { error } = await supabase
        .from('staff')
        .update(updateData)
        .eq('id', id);
      
      if (error) {
        throw error;
      }

      // Update the local state
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
      
      // If this is the current user, update their info
      if (currentUser && currentUser.id === id) {
        setCurrentUser({
          ...currentUser,
          name,
          role,
        });
        
        // Update localStorage
        const storedStaff = localStorage.getItem('mirCafeStaffLogin');
        if (storedStaff) {
          const staffData = JSON.parse(storedStaff);
          localStorage.setItem('mirCafeStaffLogin', JSON.stringify({
            ...staffData,
            name,
            role,
            ...(password ? { password } : {})
          }));
        }
      }
    } catch (error) {
      console.error('Error updating staff member:', error);
      toast({
        title: "Error updating staff",
        description: error.message || "Failed to update staff member",
        variant: "destructive",
        duration: 1000,
      });
      throw error;
    }
  };

  const deleteStaffMember = async (id: string) => {
    try {
      // Cannot delete the owner or current user
      const staffToDelete = staffMembers.find(staff => staff.id === id);
      
      if (!staffToDelete || staffToDelete.role === 'owner' || currentUser?.id === id) {
        return false;
      }
      
      // Delete from Supabase
      const { error } = await supabase
        .from('staff')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setStaffMembers(staffMembers.filter(staff => staff.id !== id));
      
      return true;
    } catch (error) {
      console.error('Error deleting staff member:', error);
      toast({
        title: "Error deleting staff",
        description: error.message || "Failed to delete staff member",
        variant: "destructive",
        duration: 1000,
      });
      return false;
    }
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
    checkIn,
    checkOut,
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
