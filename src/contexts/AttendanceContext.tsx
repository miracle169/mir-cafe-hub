
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { staffMembers } from './AuthContext';

// Attendance entry interface
export interface AttendanceEntry {
  id: string;
  staffId: string;
  staffName: string;
  checkInTime: string;
  checkOutTime?: string;
  date: string; // YYYY-MM-DD format
}

// Cash register entry interface
export interface CashRegisterEntry {
  id: string;
  staffId: string;
  staffName: string;
  date: string; // YYYY-MM-DD format
  openingAmount: number;
  closingAmount?: number;
  reason?: string;
}

// Attendance context type
interface AttendanceContextType {
  entries: AttendanceEntry[];
  cashRegisterEntries: CashRegisterEntry[];
  checkIn: (staffId: string, staffName: string) => void;
  checkOut: (staffId: string) => void;
  getStaffAttendance: (staffId: string, date: string) => AttendanceEntry | undefined;
  getEntriesByDate: (date: string) => AttendanceEntry[];
  getPresentStaff: () => { id: string; name: string }[];
  getAttendanceReport: (month: number, year: number) => Record<string, number>;
  registerOpeningCash: (staffId: string, staffName: string, amount: number, reason?: string) => void;
  registerClosingCash: (staffId: string, amount: number) => void;
  getTodayCashRegister: (staffId: string) => CashRegisterEntry | undefined;
  getDailyCashRegisterEntries: (date: string) => CashRegisterEntry[];
}

// Create the context
const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

// Helper to get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Provider component
export const AttendanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [entries, setEntries] = useState<AttendanceEntry[]>([]);
  const [cashRegisterEntries, setCashRegisterEntries] = useState<CashRegisterEntry[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedEntries = localStorage.getItem('mir-attendance');
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }

    const savedCashEntries = localStorage.getItem('mir-cash-register');
    if (savedCashEntries) {
      setCashRegisterEntries(JSON.parse(savedCashEntries));
    }
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem('mir-attendance', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem('mir-cash-register', JSON.stringify(cashRegisterEntries));
  }, [cashRegisterEntries]);

  // Check in a staff member
  const checkIn = (staffId: string, staffName: string) => {
    const today = getTodayDate();
    
    // Check if staff already checked in today
    const existingEntry = entries.find(
      (entry) => entry.staffId === staffId && entry.date === today && !entry.checkOutTime
    );

    if (existingEntry) {
      return; // Already checked in
    }

    const newEntry: AttendanceEntry = {
      id: Date.now().toString(),
      staffId,
      staffName,
      checkInTime: new Date().toISOString(),
      date: today,
    };

    setEntries((prevEntries) => [...prevEntries, newEntry]);
  };

  // Check out a staff member
  const checkOut = (staffId: string) => {
    const today = getTodayDate();
    
    setEntries((prevEntries) =>
      prevEntries.map((entry) => {
        if (entry.staffId === staffId && entry.date === today && !entry.checkOutTime) {
          return {
            ...entry,
            checkOutTime: new Date().toISOString(),
          };
        }
        return entry;
      })
    );
  };

  // Get staff attendance for a specific date
  const getStaffAttendance = (staffId: string, date: string) => {
    return entries.find((entry) => entry.staffId === staffId && entry.date === date);
  };

  // Get all entries for a specific date
  const getEntriesByDate = (date: string) => {
    return entries.filter((entry) => entry.date === date);
  };

  // Get currently present staff
  const getPresentStaff = () => {
    const today = getTodayDate();
    const presentEntries = entries.filter(
      (entry) => entry.date === today && !entry.checkOutTime
    );

    return presentEntries.map((entry) => ({
      id: entry.staffId,
      name: entry.staffName,
    }));
  };

  // Get attendance report for a month
  const getAttendanceReport = (month: number, year: number) => {
    const report: Record<string, number> = {};

    // Initialize report with all staff members
    staffMembers.forEach((staff) => {
      report[staff.id] = 0;
    });

    // Filter entries for the specified month and year
    const monthEntries = entries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate.getMonth() === month && entryDate.getFullYear() === year;
    });

    // Count days present for each staff member
    monthEntries.forEach((entry) => {
      if (report[entry.staffId] !== undefined) {
        report[entry.staffId]++;
      }
    });

    return report;
  };

  // Register opening cash amount
  const registerOpeningCash = (staffId: string, staffName: string, amount: number, reason?: string) => {
    const today = getTodayDate();
    
    // Check if there's already an entry for today
    const existingEntry = cashRegisterEntries.find(
      (entry) => entry.staffId === staffId && entry.date === today
    );

    if (existingEntry) {
      // Update the existing entry
      setCashRegisterEntries((prevEntries) =>
        prevEntries.map((entry) =>
          entry.id === existingEntry.id
            ? { ...entry, openingAmount: amount, reason }
            : entry
        )
      );
    } else {
      // Create a new entry
      const newEntry: CashRegisterEntry = {
        id: Date.now().toString(),
        staffId,
        staffName,
        date: today,
        openingAmount: amount,
        reason,
      };

      setCashRegisterEntries((prevEntries) => [...prevEntries, newEntry]);
    }
  };

  // Register closing cash amount
  const registerClosingCash = (staffId: string, amount: number) => {
    const today = getTodayDate();
    
    setCashRegisterEntries((prevEntries) =>
      prevEntries.map((entry) => {
        if (entry.staffId === staffId && entry.date === today) {
          return {
            ...entry,
            closingAmount: amount,
          };
        }
        return entry;
      })
    );
  };

  // Get today's cash register entry for a staff member
  const getTodayCashRegister = (staffId: string) => {
    const today = getTodayDate();
    return cashRegisterEntries.find(
      (entry) => entry.staffId === staffId && entry.date === today
    );
  };

  // Get all cash register entries for a specific date
  const getDailyCashRegisterEntries = (date: string) => {
    return cashRegisterEntries.filter((entry) => entry.date === date);
  };

  // Context value
  const value = {
    entries,
    cashRegisterEntries,
    checkIn,
    checkOut,
    getStaffAttendance,
    getEntriesByDate,
    getPresentStaff,
    getAttendanceReport,
    registerOpeningCash,
    registerClosingCash,
    getTodayCashRegister,
    getDailyCashRegisterEntries,
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
