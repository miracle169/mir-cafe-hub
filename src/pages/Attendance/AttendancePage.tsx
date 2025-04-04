
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAttendance } from '@/contexts/AttendanceContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { LogIn, LogOut, Clock } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const AttendancePage = () => {
  const { attendanceRecords, checkIn, checkOut, getAttendanceForDate } = useAttendance();
  const { currentUser, staffMembers = [] } = useAuth(); // Provide a default empty array
  const { toast } = useToast();
  const [date, setDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [todayEntries, setTodayEntries] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>('today');

  useEffect(() => {
    const filteredEntries = getAttendanceForDate(date);
    setTodayEntries(filteredEntries);
  }, [date, attendanceRecords, getAttendanceForDate]);

  const handleCheckIn = (staffId: string) => {
    try {
      checkIn(staffId);
      toast({
        title: "Checked In",
        description: `Staff member has been checked in successfully`,
        duration: 1000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check in",
        variant: "destructive",
        duration: 1000,
      });
    }
  };

  const handleCheckOut = (staffId: string) => {
    try {
      checkOut(staffId);
      toast({
        title: "Checked Out",
        description: `Staff member has been checked out successfully`,
        duration: 1000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check out",
        variant: "destructive",
        duration: 1000,
      });
    }
  };

  const isCheckedIn = (staffId: string) => {
    return todayEntries.some(
      (entry) => entry.staffId === staffId && !entry.checkOutTime
    );
  };

  const isCheckedOut = (staffId: string) => {
    return todayEntries.some(
      (entry) => entry.staffId === staffId && entry.checkOutTime
    );
  };

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
  };

  const today = new Date().toISOString().split('T')[0];
  const isToday = date === today;

  if (!staffMembers || staffMembers.length === 0) {
    return (
      <Layout title="Attendance" showBackButton>
        <div className="mir-container p-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center py-8">
                <h3 className="font-medium text-lg mb-2">No Staff Members Available</h3>
                <p className="text-mir-gray-dark mb-4">
                  There are no staff members configured in the system.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => window.history.back()}
                >
                  Go Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Attendance" showBackButton>
      <div className="mir-container">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="today" className="mt-4">
            <div className="space-y-4">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <div className="text-center mb-3">
                  <h3 className="font-bold text-mir-black">Today's Attendance</h3>
                  <p className="text-sm text-mir-gray-dark">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                
                <div className="space-y-2">
                  {staffMembers.map((staff) => (
                    <Card key={staff.id} className="bg-white shadow-sm">
                      <CardContent className="p-3 flex justify-between items-center">
                        <div className="flex items-center">
                          <Badge 
                            variant={isCheckedIn(staff.id) ? "success" : isCheckedOut(staff.id) ? "secondary" : "outline"}
                            className={`mr-2 ${isCheckedIn(staff.id) ? "bg-green-100 text-green-700" : isCheckedOut(staff.id) ? "bg-gray-100 text-gray-700" : ""}`}
                          >
                            {isCheckedIn(staff.id) ? "Present" : isCheckedOut(staff.id) ? "Left" : "Absent"}
                          </Badge>
                          <span className="font-medium">{staff.name}</span>
                        </div>
                        
                        <div className="flex space-x-2">
                          {!isCheckedIn(staff.id) && !isCheckedOut(staff.id) && (
                            <Button 
                              size="sm" 
                              className="bg-mir-red text-white"
                              onClick={() => handleCheckIn(staff.id)}
                            >
                              <LogIn className="h-4 w-4 mr-1" />
                              Check In
                            </Button>
                          )}
                          
                          {isCheckedIn(staff.id) && !isCheckedOut(staff.id) && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleCheckOut(staff.id)}
                            >
                              <LogOut className="h-4 w-4 mr-1" />
                              Check Out
                            </Button>
                          )}
                          
                          {isCheckedOut(staff.id) && (
                            <Button 
                              size="sm" 
                              variant="ghost"
                              disabled
                            >
                              <Clock className="h-4 w-4 mr-1" />
                              Completed
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <h3 className="font-bold text-mir-black mb-2">Today's Log</h3>
                
                {todayEntries.length === 0 ? (
                  <p className="text-center text-mir-gray-dark py-3">No attendance records for today</p>
                ) : (
                  <div className="space-y-2">
                    {todayEntries.map((entry) => (
                      <div key={entry.id} className="flex justify-between items-center p-2 border-b last:border-b-0">
                        <span className="font-medium">{entry.staffName}</span>
                        <div className="text-sm text-mir-gray-dark">
                          <div>
                            In: {new Date(entry.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          {entry.checkOutTime && (
                            <div>
                              Out: {new Date(entry.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="mt-4">
            <div className="space-y-4">
              <div className="mb-4">
                <label htmlFor="date-select" className="block text-sm font-medium mb-1">
                  Select Date
                </label>
                <Input
                  id="date-select"
                  type="date"
                  value={date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  max={today}
                />
              </div>
              
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <h3 className="font-bold text-mir-black mb-2">
                  Attendance for {new Date(date).toLocaleDateString()}
                </h3>
                
                {todayEntries.length === 0 ? (
                  <p className="text-center text-mir-gray-dark py-3">No attendance records for this date</p>
                ) : (
                  <div className="space-y-2">
                    {todayEntries.map((entry) => (
                      <Card key={entry.id} className="bg-white shadow-sm">
                        <CardContent className="p-3">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{entry.staffName}</span>
                            <Badge 
                              variant={entry.checkOutTime ? "secondary" : "success"}
                              className={entry.checkOutTime ? "bg-gray-100 text-gray-700" : "bg-green-100 text-green-700"}
                            >
                              {entry.checkOutTime ? "Complete" : "Incomplete"}
                            </Badge>
                          </div>
                          
                          <div className="mt-2 text-sm">
                            <div className="flex justify-between items-center">
                              <span className="text-mir-gray-dark">Check In</span>
                              <span>{new Date(entry.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            
                            {entry.checkOutTime && (
                              <div className="flex justify-between items-center">
                                <span className="text-mir-gray-dark">Check Out</span>
                                <span>{new Date(entry.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            )}
                            
                            {entry.checkInTime && entry.checkOutTime && (
                              <div className="flex justify-between items-center font-medium">
                                <span>Duration</span>
                                <span>
                                  {(() => {
                                    const checkIn = new Date(entry.checkInTime);
                                    const checkOut = new Date(entry.checkOutTime);
                                    const diffMs = checkOut.getTime() - checkIn.getTime();
                                    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
                                    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                                    return `${diffHrs}h ${diffMins}m`;
                                  })()}
                                </span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AttendancePage;
