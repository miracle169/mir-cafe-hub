
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Define the attendance record type
interface AttendanceRecord {
  id: string;
  staffId: string;
  date: string;
  checkInTime: string;
  checkOutTime?: string;
}

// Define the context type
interface AttendanceContextType {
  addAttendanceRecord: (staffId: string, checkIn: boolean) => Promise<void>;
  getAttendanceForDate: (date: string) => AttendanceRecord[];
  getAttendanceForStaff: (staffId: string) => AttendanceRecord[];
  getAttendanceForToday: (staffId: string) => AttendanceRecord[];
  checkIn: (staffId: string) => Promise<void>;
  checkOut: (staffId: string) => Promise<void>;
}

// Create the context
const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

// Provider component
export const AttendanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const { toast } = useToast();

  // Fetch attendance records on mount
  useEffect(() => {
    fetchAttendanceRecords();
  }, []);

  // Fetch attendance records from the database
  const fetchAttendanceRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        setAttendanceRecords(data.map(record => ({
          id: record.id,
          staffId: record.staff_id,
          date: record.date,
          checkInTime: record.check_in_time,
          checkOutTime: record.check_out_time
        })));
      }
    } catch (error) {
      console.error('Error fetching attendance records:', error);
    }
  };

  // Add a new attendance record
  const addAttendanceRecord = async (staffId: string, checkIn: boolean) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();

      if (checkIn) {
        // Add check-in record
        const { error } = await supabase
          .from('attendance')
          .insert({
            staff_id: staffId,
            date: today,
            check_in_time: now
          });

        if (error) throw error;
      } else {
        // Find the latest check-in record for this staff member that doesn't have a check-out time
        const todayRecords = getAttendanceForToday(staffId);
        const latestCheckIn = todayRecords.length > 0 ? 
          todayRecords[todayRecords.length - 1] : null;

        if (latestCheckIn && !latestCheckIn.checkOutTime) {
          // Update the existing record with check-out time
          const { error } = await supabase
            .from('attendance')
            .update({ check_out_time: now })
            .eq('id', latestCheckIn.id);

          if (error) throw error;
        } else {
          // Create a new record with both check-in and check-out times
          const { error } = await supabase
            .from('attendance')
            .insert({
              staff_id: staffId,
              date: today,
              check_in_time: now,
              check_out_time: now
            });

          if (error) throw error;
        }
      }

      // Refresh attendance records
      await fetchAttendanceRecords();

    } catch (error) {
      console.error('Error recording attendance:', error);
      throw error;
    }
  };

  // Check in
  const checkIn = async (staffId: string) => {
    try {
      await addAttendanceRecord(staffId, true);
      toast({
        title: "Checked In",
        description: `You have checked in at ${new Date().toLocaleTimeString()}`,
        duration: 1000,
      });
    } catch (error) {
      console.error('Error checking in:', error);
      toast({
        title: "Check-in Failed",
        description: "Failed to record check-in",
        variant: "destructive",
        duration: 1000,
      });
      throw error;
    }
  };

  // Check out
  const checkOut = async (staffId: string) => {
    try {
      await addAttendanceRecord(staffId, false);
      toast({
        title: "Checked Out",
        description: `You have checked out at ${new Date().toLocaleTimeString()}`,
        duration: 1000,
      });
    } catch (error) {
      console.error('Error checking out:', error);
      toast({
        title: "Check-out Failed",
        description: "Failed to record check-out",
        variant: "destructive",
        duration: 1000,
      });
      throw error;
    }
  };

  // Get attendance records for a specific date
  const getAttendanceForDate = (date: string) => {
    return attendanceRecords.filter(record => record.date === date);
  };

  // Get attendance records for a specific staff member
  const getAttendanceForStaff = (staffId: string) => {
    return attendanceRecords.filter(record => record.staffId === staffId);
  };

  // Get today's attendance records for a specific staff member
  const getAttendanceForToday = (staffId: string) => {
    const today = new Date().toISOString().split('T')[0];
    return attendanceRecords.filter(
      record => record.staffId === staffId && record.date === today
    );
  };

  const value = {
    addAttendanceRecord,
    getAttendanceForDate,
    getAttendanceForStaff,
    getAttendanceForToday,
    checkIn,
    checkOut,
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
