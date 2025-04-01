
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
  login: (userName: string) => boolean;
  logout: () => void;
  staffMembers: User[];  // Ensure staffMembers is included in the context type
  addStaffMember: (name: string, role: UserRole) => void;
  updateStaffMember: (id: string, name: string, role: UserRole) => void;
  deleteStaffMember: (id: string) => boolean;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Sample staff members
const initialStaffMembers: User[] = [
  { id: '1', name: 'Owner', role: 'owner' },
  { id: '2', name: 'Raj', role: 'staff' },
  { id: '3', name: 'Priya', role: 'staff' },
  { id: '4', name: 'Amit', role: 'staff' },
];

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [staffMembers, setStaffMembers] = useState<User[]>([]);

  // Initialize staff members and check for logged in user on mount
  useEffect(() => {
    const savedStaffMembers = localStorage.getItem('mir-staff-members');
    if (savedStaffMembers) {
      setStaffMembers(JSON.parse(savedStaffMembers));
    } else {
      setStaffMembers(initialStaffMembers);
      localStorage.setItem('mir-staff-members', JSON.stringify(initialStaffMembers));
    }

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

  // Save staff members to localStorage when they change
  useEffect(() => {
    if (staffMembers.length > 0) {
      localStorage.setItem('mir-staff-members', JSON.stringify(staffMembers));
    }
  }, [staffMembers]);

  const addStaffMember = (name: string, role: UserRole) => {
    const newStaff: User = {
      id: Date.now().toString(),
      name,
      role
    };
    setStaffMembers([...staffMembers, newStaff]);
  };

  const updateStaffMember = (id: string, name: string, role: UserRole) => {
    setStaffMembers(staffMembers.map(staff => {
      if (staff.id === id) {
        return { ...staff, name, role };
      }
      return staff;
    }));

    // Update current user if the edited staff is the logged-in user
    if (currentUser && currentUser.id === id) {
      setCurrentUser({ ...currentUser, name, role });
    }
  };

  const deleteStaffMember = (id: string) => {
    // Prevent deleting the owner
    const staffToDelete = staffMembers.find(staff => staff.id === id);
    if (staffToDelete?.role === 'owner') {
      return false;
    }

    // Prevent deleting the currently logged-in user
    if (currentUser && currentUser.id === id) {
      return false;
    }

    setStaffMembers(staffMembers.filter(staff => staff.id !== id));
    return true;
  };

  const login = (userName: string) => {
    // Find the user in staff members and auto-determine their role
    const user = staffMembers.find(
      (staff) => staff.name.toLowerCase() === userName.toLowerCase()
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
    staffMembers,  // Ensure staffMembers is included in the context value
    addStaffMember,
    updateStaffMember,
    deleteStaffMember
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
export { initialStaffMembers };
