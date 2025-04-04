
import React, { useState, useEffect } from 'react';
import { useInventory } from '@/contexts/InventoryContext';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

const PurchaseHistoryDisplay = () => {
  const { purchaseLogs, items } = useInventory();
  const [filteredLogs, setFilteredLogs] = useState(purchaseLogs);
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(new Date().setDate(new Date().getDate() - 30))
  );
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<string>('all');
  const [selectedStaff, setSelectedStaff] = useState<string>('all');

  // Get unique staff members from purchase logs
  const staffMembers = Array.from(
    new Set(purchaseLogs.map(log => log.staffName))
  );

  useEffect(() => {
    let filtered = [...purchaseLogs];

    // Filter by date range
    if (startDate && endDate) {
      filtered = filtered.filter(log => {
        const logDate = new Date(log.date);
        return logDate >= startDate && logDate <= endDate;
      });
    }

    // Filter by search term (staff name or item name)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        log => 
          log.staffName.toLowerCase().includes(term) ||
          log.items.some(item => item.itemName.toLowerCase().includes(term))
      );
    }

    // Filter by selected item
    if (selectedItem !== 'all') {
      filtered = filtered.filter(log =>
        log.items.some(item => item.itemId === selectedItem)
      );
    }

    // Filter by selected staff
    if (selectedStaff !== 'all') {
      filtered = filtered.filter(log => log.staffName === selectedStaff);
    }

    setFilteredLogs(filtered);
  }, [purchaseLogs, startDate, endDate, searchTerm, selectedItem, selectedStaff]);

  // Calculate totals
  const calculateTotals = () => {
    const itemTotals: { [key: string]: { quantity: number; amount: number } } = {};
    
    filteredLogs.forEach(log => {
      log.items.forEach(item => {
        if (!itemTotals[item.itemName]) {
          itemTotals[item.itemName] = { quantity: 0, amount: 0 };
        }
        itemTotals[item.itemName].quantity += item.quantity;
        itemTotals[item.itemName].amount += item.quantity * item.unitPrice;
      });
    });
    
    return itemTotals;
  };

  const itemTotals = calculateTotals();

  // Calculate total money given to staff and balance
  const staffSummary: { [key: string]: { received: number; spent: number; balance: number } } = {};
  filteredLogs.forEach(log => {
    if (!staffSummary[log.staffName]) {
      staffSummary[log.staffName] = { received: 0, spent: 0, balance: 0 };
    }
    staffSummary[log.staffName].received += log.moneyReceived;
    staffSummary[log.staffName].spent += log.totalAmount;
    staffSummary[log.staffName].balance += log.balance;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Purchase History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4 mb-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Filter by Item</label>
              <Select value={selectedItem} onValueChange={setSelectedItem}>
                <SelectTrigger>
                  <SelectValue placeholder="All Items" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  {items.map(item => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Filter by Staff</label>
              <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                <SelectTrigger>
                  <SelectValue placeholder="All Staff" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Staff</SelectItem>
                  {staffMembers.map((name, index) => (
                    <SelectItem key={index} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:col-span-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by staff or item..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="py-2">
                <CardTitle className="text-sm font-medium">Item Purchase Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Name</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Total Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(itemTotals).map(([itemName, totals], index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{itemName}</TableCell>
                        <TableCell className="text-right">{totals.quantity.toFixed(2)}</TableCell>
                        <TableCell className="text-right">₹{totals.amount.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-2">
                <CardTitle className="text-sm font-medium">Staff Purchase Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff Name</TableHead>
                      <TableHead className="text-right">Money Received</TableHead>
                      <TableHead className="text-right">Amount Spent</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(staffSummary).map(([staffName, summary], index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{staffName}</TableCell>
                        <TableCell className="text-right">₹{summary.received.toFixed(2)}</TableCell>
                        <TableCell className="text-right">₹{summary.spent.toFixed(2)}</TableCell>
                        <TableCell className="text-right">₹{summary.balance.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-2">
                <CardTitle className="text-sm font-medium">Purchase Log Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Staff</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead className="text-right">Total Amount</TableHead>
                      <TableHead className="text-right">Money Received</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{format(new Date(log.date), 'PPP')}</TableCell>
                        <TableCell>{log.staffName}</TableCell>
                        <TableCell>
                          <ul className="list-disc pl-5">
                            {log.items.map((item, index) => (
                              <li key={index}>
                                {item.itemName} ({item.quantity} @ ₹{item.unitPrice})
                              </li>
                            ))}
                          </ul>
                        </TableCell>
                        <TableCell className="text-right">₹{log.totalAmount.toFixed(2)}</TableCell>
                        <TableCell className="text-right">₹{log.moneyReceived.toFixed(2)}</TableCell>
                        <TableCell className="text-right">₹{log.balance.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchaseHistoryDisplay;
