import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useLocalStorage } from '@/hooks/use-local-storage';

// Attendance record interface
export interface AttendanceRecord {
  id: string;
  staffId: string;
  staffName: string;
  date: string;
  checkInTime: string;
  checkOutTime?: string;
}

// Cash register record interface
export interface CashRegisterRecord {
  id: string;
  staffId: string;
  staffName: string;
  date: string;
  openingAmount: number;
  closingAmount?: number;
  reason?: string;
}

// Context type definition
export interface AttendanceContextType {
  attendance: AttendanceRecord[];
  cashRegisters: CashRegisterRecord[];
  checkIn: (staffId?: string) => Promise<void>;
  checkOut: (staffId?: string) => Promise<void>;
  getAttendanceForToday: (staffId?: string) => AttendanceRecord[];
  getAttendanceForDate: (date: string) => AttendanceRecord[];
  getPresentStaff: () => AttendanceRecord[];
  registerOpeningCash: (staffId: string, staffName: string, amount: number, reason?: string) => Promise<void>;
  registerClosingCash: (staffId: string, amount: number) => Promise<void>;
  getTodayCashRegister: (staffId: string) => CashRegisterRecord | undefined;
  syncAttendance: () => Promise<void>;
  syncCashRegisters: () => Promise<void>;
}

// Create the context
const AttendanceContext = createContext<AttendanceContextType>({
  attendance: [],
  cashRegisters: [],
  checkIn: async () => {},
  checkOut: async () => {},
  getAttendanceForToday: () => [],
  getAttendanceForDate: () => [],
  getPresentStaff: () => [],
  registerOpeningCash: async () => {},
  registerClosingCash: async () => {},
  getTodayCashRegister: () => undefined,
  syncAttendance: async () => {},
  syncCashRegisters: async () => {},
});

// Provider component
export const AttendanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [cashRegisters, setCashRegisters] = useState<CashRegisterRecord[]>([]);
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  // Load data from Supabase when the user changes
  useEffect(() => {
    if (currentUser) {
      syncAttendance();
      syncCashRegisters();
    }
  }, [currentUser]);
  
  // Sync attendance records from Supabase
  const syncAttendance = async () => {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          id,
          staff_id,
          date,
          check_in_time,
          check_out_time,
          created_at,
          staff:staff_id (name)
        `)
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      const formattedAttendance = data.map((record) => {
        // Fix: Properly handle staff name property based on the actual response structure
        // Since TypeScript is complaining about accessing name on an array, we need to check
        // if the staff property is an object with a name property or handle it differently
        let staffName = 'Unknown';
        if (record.staff) {
          // Check if staff is an object with a direct name property
          if (typeof record.staff === 'object' && 'name' in record.staff) {
            staffName = (record.staff.name as string) || 'Unknown';
          } 
          // If staff is anything else (e.g., an array), try to find the name some other way
          else if (Array.isArray(record.staff) && record.staff.length > 0) {
            staffName = (record.staff[0]?.name as string) || 'Unknown';
          }
        }
        
        return {
          id: record.id,
          staffId: record.staff_id,
          staffName: staffName,
          date: record.date,
          checkInTime: record.check_in_time,
          checkOutTime: record.check_out_time || undefined,
        };
      });
      
      setAttendance(formattedAttendance);
    } catch (error) {
      console.error('Error syncing attendance:', error);
      toast({
        title: 'Sync Error',
        description: 'Failed to sync attendance data',
        variant: 'destructive',
      });
    }
  };
  
  // Sync cash register records from Supabase
  const syncCashRegisters = async () => {
    try {
      const { data, error } = await supabase
        .from('cash_register')
        .select(`
          id,
          staff_id,
          date,
          opening_amount,
          closing_amount,
          reason,
          created_at,
          staff:staff_id (name)
        `)
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      const formattedCashRegisters = data.map((record) => {
        // Fix: Apply the same solution for accessing staff name in cash register records
        let staffName = 'Unknown';
        if (record.staff) {
          // Check if staff is an object with a direct name property
          if (typeof record.staff === 'object' && 'name' in record.staff) {
            staffName = (record.staff.name as string) || 'Unknown';
          } 
          // If staff is anything else (e.g., an array), try to find the name some other way
          else if (Array.isArray(record.staff) && record.staff.length > 0) {
            staffName = (record.staff[0]?.name as string) || 'Unknown';
          }
        }
        
        return {
          id: record.id,
          staffId: record.staff_id,
          staffName: staffName,
          date: record.date,
          openingAmount: record.opening_amount,
          closingAmount: record.closing_amount,
          reason: record.reason,
        };
      });
      
      setCashRegisters(formattedCashRegisters);
    } catch (error) {
      console.error('Error syncing cash registers:', error);
      toast({
        title: 'Sync Error',
        description: 'Failed to sync cash register data',
        variant: 'destructive',
      });
    }
  };
  
  // Check in function
  const checkIn = async (staffId?: string) => {
    const userId = staffId || (currentUser ? currentUser.id : null);
    
    // Fix: Property 'staffMembers' does not exist on type 'AuthUser'
    // We need to safely access the currentUser object and handle potential undefined values
    let userName = 'Unknown';
    
    if (staffId && currentUser) {
      // If we're checking in someone else and we're the owner
      if (currentUser.role === 'owner') {
        // Get staff name from somewhere else since currentUser.staffMembers doesn't exist
        // For now, use a placeholder - you might need to get this from another context or API
        userName = staffId; // Using staffId as fallback
      } else {
        userName = currentUser.name || 'Unknown';
      }
    } else if (currentUser) {
      // We're checking in ourselves
      userName = currentUser.name || 'Unknown';
    }
    
    if (!userId) {
      toast({
        title: 'Error',
        description: 'Staff ID is required to check in',
        variant: 'destructive',
      });
      return;
    }
    
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
    
    try {
      // Create new attendance record
      const { data, error } = await supabase
        .from('attendance')
        .insert({
          staff_id: userId,
          date: today,
          check_in_time: now.toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Add to local state
      const newRecord: AttendanceRecord = {
        id: data.id,
        staffId: data.staff_id,
        staffName: userName,
        date: data.date,
        checkInTime: data.check_in_time,
      };
      
      setAttendance(prev => [newRecord, ...prev]);
      
      toast({
        title: 'Checked In',
        description: `Successfully checked in at ${now.toLocaleTimeString()}`,
      });
    } catch (error) {
      console.error('Error checking in:', error);
      toast({
        title: 'Check In Failed',
        description: 'Failed to record check in',
        variant: 'destructive',
      });
    }
  };
  
  // Check out function
  const checkOut = async (staffId?: string) => {
    const userId = staffId || (currentUser ? currentUser.id : null);
    
    if (!userId) {
      toast({
        title: 'Error',
        description: 'Staff ID is required to check out',
        variant: 'destructive',
      });
      return;
    }
    
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Find the last check-in without check-out
    const todayRecords = attendance.filter(
      record => record.staffId === userId && 
                record.date === today && 
                !record.checkOutTime
    );
    
    if (todayRecords.length === 0) {
      toast({
        title: 'Error',
        description: 'No active check-in found',
        variant: 'destructive',
      });
      return;
    }
    
    const lastCheckIn = todayRecords[0];
    
    try {
      // Update attendance record
      const { error } = await supabase
        .from('attendance')
        .update({ check_out_time: now.toISOString() })
        .eq('id', lastCheckIn.id);
      
      if (error) throw error;
      
      // Update local state
      setAttendance(prev => 
        prev.map(record => 
          record.id === lastCheckIn.id 
            ? { ...record, checkOutTime: now.toISOString() } 
            : record
        )
      );
      
      toast({
        title: 'Checked Out',
        description: `Successfully checked out at ${now.toLocaleTimeString()}`,
      });
    } catch (error) {
      console.error('Error checking out:', error);
      toast({
        title: 'Check Out Failed',
        description: 'Failed to record check out',
        variant: 'destructive',
      });
    }
  };
  
  // Get attendance records for today
  const getAttendanceForToday = (staffId?: string) => {
    const userId = staffId || (currentUser ? currentUser.id : null);
    
    if (!userId) return [];
    
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return attendance.filter(
      record => record.staffId === userId && record.date === today
    ).sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime());
  };
  
  // Get attendance records for a specific date
  const getAttendanceForDate = (date: string) => {
    return attendance.filter(record => record.date === date)
      .sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime());
  };
  
  // Get currently present staff
  const getPresentStaff = () => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Find staff who have checked in today but not checked out
    return attendance.filter(
      record => record.date === today && !record.checkOutTime
    );
  };
  
  // Register opening cash
  const registerOpeningCash = async (staffId: string, staffName: string, amount: number, reason?: string) => {
    if (!staffId) {
      toast({
        title: 'Error',
        description: 'Staff ID is required to register cash',
        variant: 'destructive',
      });
      return;
    }
    
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Check if there's already a register for today
    const todayRegister = cashRegisters.find(
      register => register.staffId === staffId && register.date === today
    );
    
    if (todayRegister) {
      toast({
        title: 'Error',
        description: 'Cash register already opened for today',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      // Create new cash register record
      const { data, error } = await supabase
        .from('cash_register')
        .insert({
          staff_id: staffId,
          date: today,
          opening_amount: amount,
          reason: reason || null
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Add to local state
      const newRegister: CashRegisterRecord = {
        id: data.id,
        staffId: data.staff_id,
        staffName: staffName,
        date: data.date,
        openingAmount: data.opening_amount,
        reason: data.reason
      };
      
      setCashRegisters(prev => [newRegister, ...prev]);
      
      toast({
        title: 'Cash Register Opened',
        description: `Successfully opened register with ₹${amount}`,
      });
    } catch (error) {
      console.error('Error opening cash register:', error);
      toast({
        title: 'Failed to Open Register',
        description: 'Failed to record opening cash',
        variant: 'destructive',
      });
    }
  };
  
  // Register closing cash
  const registerClosingCash = async (staffId: string, amount: number) => {
    if (!staffId) {
      toast({
        title: 'Error',
        description: 'Staff ID is required to close the register',
        variant: 'destructive',
      });
      return;
    }
    
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Find today's register
    const todayRegister = cashRegisters.find(
      register => register.staffId === staffId && register.date === today
    );
    
    if (!todayRegister) {
      toast({
        title: 'Error',
        description: 'No open cash register found for today',
        variant: 'destructive',
      });
      return;
    }
    
    if (todayRegister.closingAmount !== undefined) {
      toast({
        title: 'Error',
        description: 'Cash register already closed for today',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      // Update cash register record
      const { error } = await supabase
        .from('cash_register')
        .update({
          closing_amount: amount
        })
        .eq('id', todayRegister.id);
      
      if (error) throw error;
      
      // Update local state
      setCashRegisters(prev => 
        prev.map(register => 
          register.id === todayRegister.id 
            ? { ...register, closingAmount: amount } 
            : register
        )
      );
      
      toast({
        title: 'Cash Register Closed',
        description: `Successfully closed register with ₹${amount}`,
      });
    } catch (error) {
      console.error('Error closing cash register:', error);
      toast({
        title: 'Failed to Close Register',
        description: 'Failed to record closing cash',
        variant: 'destructive',
      });
    }
  };
  
  // Get today's cash register
  const getTodayCashRegister = (staffId: string) => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return cashRegisters.find(register => register.staffId === staffId && register.date === today);
  };
  
  // Context value
  const value = {
    attendance,
    cashRegisters,
    checkIn,
    checkOut,
    getAttendanceForToday,
    getAttendanceForDate,
    getPresentStaff,
    registerOpeningCash,
    registerClosingCash,
    getTodayCashRegister,
    syncAttendance,
    syncCashRegisters,
  };
  
  return (
    <AttendanceContext.Provider value={value}>
      {children}
    </AttendanceContext.Provider>
  );
};

// Hook for using the attendance context
export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};
