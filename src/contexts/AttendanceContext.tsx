
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

// Attendance record interface
interface AttendanceRecord {
  id: string;
  staffId: string;
  staffName?: string;
  date: string;
  checkInTime: string;
  checkOutTime: string | null;
}

// Cash register entry interface
interface CashRegisterEntry {
  id: string;
  staffId: string;
  staffName?: string;
  date: string;
  openingAmount: number;
  closingAmount: number | null;
  reason: string | null;
}

// Context type
interface AttendanceContextType {
  attendanceRecords: AttendanceRecord[];
  cashRegisterEntries: CashRegisterEntry[];
  todayAttendance: AttendanceRecord[];
  checkIn: () => Promise<void>;
  checkOut: (attendanceId: string) => Promise<void>;
  openCashRegister: (amount: number) => Promise<void>;
  closeCashRegister: (id: string, amount: number, reason?: string) => Promise<void>;
  todayCashRegister: CashRegisterEntry | null;
  isCheckedIn: () => boolean;
  isCashRegisterOpen: () => boolean;
  fetchAttendanceRecords: () => Promise<void>;
  fetchCashRegisterEntries: () => Promise<void>;
  getLatestCheckIn: () => AttendanceRecord | null;
}

// Create the context
const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

// Provider component
export const AttendanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [cashRegisterEntries, setCashRegisterEntries] = useState<CashRegisterEntry[]>([]);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  // Load from Supabase on mount and when user changes
  useEffect(() => {
    if (currentUser) {
      fetchAttendanceRecords();
      fetchCashRegisterEntries();
    }
  }, [currentUser]);

  // Fetch attendance records from Supabase
  const fetchAttendanceRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          id,
          staff_id,
          date,
          check_in_time,
          check_out_time
        `)
        .order('date', { ascending: false });

      if (error) throw error;

      const formattedData = await Promise.all(
        data.map(async (record) => {
          // Get staff name for each record
          const { data: staffData, error: staffError } = await supabase
            .from('staff')
            .select('name')
            .eq('id', record.staff_id)
            .single();

          if (staffError) console.error('Error fetching staff name:', staffError);

          return {
            id: record.id,
            staffId: record.staff_id,
            staffName: staffData?.name || 'Unknown',
            date: record.date,
            checkInTime: record.check_in_time,
            checkOutTime: record.check_out_time,
          };
        })
      );

      setAttendanceRecords(formattedData);
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch attendance records',
        variant: 'destructive',
        duration: 1000,
      });
    }
  };

  // Fetch cash register entries from Supabase
  const fetchCashRegisterEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('cash_register')
        .select(`
          id,
          staff_id,
          date,
          opening_amount,
          closing_amount,
          reason
        `)
        .order('date', { ascending: false });

      if (error) throw error;

      const formattedData = await Promise.all(
        data.map(async (entry) => {
          // Get staff name for each entry
          const { data: staffData, error: staffError } = await supabase
            .from('staff')
            .select('name')
            .eq('id', entry.staff_id)
            .single();

          if (staffError) console.error('Error fetching staff name:', staffError);

          return {
            id: entry.id,
            staffId: entry.staff_id,
            staffName: staffData?.name || 'Unknown',
            date: entry.date,
            openingAmount: entry.opening_amount,
            closingAmount: entry.closing_amount,
            reason: entry.reason,
          };
        })
      );

      setCashRegisterEntries(formattedData);
    } catch (error) {
      console.error('Error fetching cash register entries:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch cash register entries',
        variant: 'destructive',
        duration: 1000,
      });
    }
  };

  // Get attendance records for today
  const todayAttendance = attendanceRecords.filter(
    (record) => record.date === new Date().toISOString().split('T')[0] && 
                record.staffId === currentUser?.id
  );

  // Check if the current user is checked in
  const isCheckedIn = () => {
    // User is checked in if there's any record for today that doesn't have a check out time
    return todayAttendance.some(record => !record.checkOutTime);
  };

  // Get the latest check in record for the current user (without a check out time)
  const getLatestCheckIn = () => {
    const openCheckIns = todayAttendance.filter(record => !record.checkOutTime);
    if (openCheckIns.length === 0) return null;
    
    // Sort by check in time descending and return the first one
    return openCheckIns.sort((a, b) => 
      new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime()
    )[0];
  };

  // Check in the current user
  const checkIn = async () => {
    if (!currentUser) {
      toast({
        title: 'Error',
        description: 'You must be logged in to check in',
        variant: 'destructive',
        duration: 1000,
      });
      return;
    }

    try {
      const now = new Date();
      const date = now.toISOString().split('T')[0];
      const checkInTime = now.toISOString();

      const { data, error } = await supabase
        .from('attendance')
        .insert({
          staff_id: currentUser.id,
          date,
          check_in_time: checkInTime,
        })
        .select();

      if (error) throw error;

      const newRecord: AttendanceRecord = {
        id: data[0].id,
        staffId: data[0].staff_id,
        staffName: currentUser.name,
        date: data[0].date,
        checkInTime: data[0].check_in_time,
        checkOutTime: data[0].check_out_time,
      };

      setAttendanceRecords([newRecord, ...attendanceRecords]);

      toast({
        title: 'Checked In',
        description: `Successfully checked in at ${new Date(checkInTime).toLocaleTimeString()}`,
        duration: 1000,
      });
    } catch (error) {
      console.error('Error checking in:', error);
      toast({
        title: 'Error',
        description: 'Failed to check in',
        variant: 'destructive',
        duration: 1000,
      });
    }
  };

  // Check out the current user for a specific attendance record
  const checkOut = async (attendanceId: string) => {
    try {
      const now = new Date();
      const checkOutTime = now.toISOString();

      const { error } = await supabase
        .from('attendance')
        .update({
          check_out_time: checkOutTime,
        })
        .eq('id', attendanceId);

      if (error) throw error;

      setAttendanceRecords(
        attendanceRecords.map((record) =>
          record.id === attendanceId
            ? { ...record, checkOutTime }
            : record
        )
      );

      toast({
        title: 'Checked Out',
        description: `Successfully checked out at ${new Date(checkOutTime).toLocaleTimeString()}`,
        duration: 1000,
      });
    } catch (error) {
      console.error('Error checking out:', error);
      toast({
        title: 'Error',
        description: 'Failed to check out',
        variant: 'destructive',
        duration: 1000,
      });
    }
  };

  // Get the cash register entry for today
  const todayCashRegister = cashRegisterEntries.find(
    (entry) => 
      entry.date === new Date().toISOString().split('T')[0] && 
      entry.staffId === currentUser?.id &&
      entry.closingAmount === null
  ) || null;

  // Check if the cash register is open
  const isCashRegisterOpen = () => {
    return todayCashRegister !== null;
  };

  // Open the cash register
  const openCashRegister = async (amount: number) => {
    if (!currentUser) {
      toast({
        title: 'Error',
        description: 'You must be logged in to open the cash register',
        variant: 'destructive',
        duration: 1000,
      });
      return;
    }

    try {
      const now = new Date();
      const date = now.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('cash_register')
        .insert({
          staff_id: currentUser.id,
          date,
          opening_amount: amount,
        })
        .select();

      if (error) throw error;

      const newEntry: CashRegisterEntry = {
        id: data[0].id,
        staffId: data[0].staff_id,
        staffName: currentUser.name,
        date: data[0].date,
        openingAmount: data[0].opening_amount,
        closingAmount: data[0].closing_amount,
        reason: data[0].reason,
      };

      setCashRegisterEntries([newEntry, ...cashRegisterEntries]);

      toast({
        title: 'Cash Register Opened',
        description: `Successfully opened cash register with ₹${amount}`,
        duration: 1000,
      });
    } catch (error) {
      console.error('Error opening cash register:', error);
      toast({
        title: 'Error',
        description: 'Failed to open cash register',
        variant: 'destructive',
        duration: 1000,
      });
    }
  };

  // Close the cash register
  const closeCashRegister = async (id: string, amount: number, reason?: string) => {
    try {
      const { error } = await supabase
        .from('cash_register')
        .update({
          closing_amount: amount,
          reason: reason || null,
        })
        .eq('id', id);

      if (error) throw error;

      setCashRegisterEntries(
        cashRegisterEntries.map((entry) =>
          entry.id === id
            ? { ...entry, closingAmount: amount, reason: reason || null }
            : entry
        )
      );

      toast({
        title: 'Cash Register Closed',
        description: `Successfully closed cash register with ₹${amount}`,
        duration: 1000,
      });
    } catch (error) {
      console.error('Error closing cash register:', error);
      toast({
        title: 'Error',
        description: 'Failed to close cash register',
        variant: 'destructive',
        duration: 1000,
      });
    }
  };

  // Context value
  const value = {
    attendanceRecords,
    cashRegisterEntries,
    todayAttendance,
    checkIn,
    checkOut,
    openCashRegister,
    closeCashRegister,
    todayCashRegister,
    isCheckedIn,
    isCashRegisterOpen,
    fetchAttendanceRecords,
    fetchCashRegisterEntries,
    getLatestCheckIn,
  };

  return <AttendanceContext.Provider value={value}>{children}</AttendanceContext.Provider>;
};

// Hook for using the attendance context
export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (context === undefined) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};
