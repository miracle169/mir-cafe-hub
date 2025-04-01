
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define user roles
export type UserRole = 'owner' | 'staff';

// Define user interface
export interface User {
  id: string;
  name: string;
  role: UserRole;
}

// Context interface
interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isOwner: boolean;
  isAuthenticated: boolean;
  login: (userName: string, role: UserRole) => boolean;
  logout: () => void;
  staffMembers: User[];  // Ensure staffMembers is included in the context type
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Sample staff members
const staffMembers: User[] = [
  { id: '1', name: 'Owner', role: 'owner' },
  { id: '2', name: 'Raj', role: 'staff' },
  { id: '3', name: 'Priya', role: 'staff' },
  { id: '4', name: 'Amit', role: 'staff' },
];

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Check for logged in user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('mir-user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  // Save user to localStorage when it changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('mir-user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('mir-user');
    }
  }, [currentUser]);

  const login = (userName: string, role: UserRole) => {
    // Find the user in staff members
    const user = staffMembers.find(
      (staff) => staff.name.toLowerCase() === userName.toLowerCase() && staff.role === role
    );
    
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    setCurrentUser,
    isOwner: currentUser?.role === 'owner',
    isAuthenticated: currentUser !== null,
    login,
    logout,
    staffMembers  // Ensure staffMembers is included in the context value
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

// Export staff members for use in other components
export { staffMembers };
