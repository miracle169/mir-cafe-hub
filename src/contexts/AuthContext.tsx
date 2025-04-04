
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
}

// Auth context type
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  currentUser: AuthUser | null;
  staffMembers: StaffMember[];
  isOwner: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  hasPermission: (requiredRole: UserRole) => boolean;
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
  },
  {
    id: '2',
    name: 'Café Staff',
    role: 'staff',
  },
  {
    id: '3',
    name: 'John Barista',
    role: 'staff',
  },
  {
    id: '4',
    name: 'Mary Server',
    role: 'staff',
  }
];

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(defaultStaffMembers);
  const [session, setSession] = useState<Session | null>(null);
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
        .select('id, name, role')
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
  
  // Login function
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
      });

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
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
      
      // Reset state
      setIsAuthenticated(false);
      setCurrentUser(null);
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
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

  // Context value
  const value = {
    isAuthenticated,
    isLoading,
    currentUser,
    staffMembers,
    isOwner,
    login,
    logout,
    hasPermission,
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
