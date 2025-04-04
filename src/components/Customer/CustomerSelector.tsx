
import React, { useState, useEffect } from 'react';
import { useCustomer } from '@/contexts/CustomerContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { UserPlus, User, Star, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const CustomerSelector = () => {
  const { customers, currentCustomer, setCurrentCustomer, addCustomer, findCustomerByPhone } = useCustomer();
  const { toast } = useToast();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [searchPhone, setSearchPhone] = useState('');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Search customers when phone number changes
  useEffect(() => {
    if (searchPhone && searchPhone.length >= 3) {
      setSearchResults(
        customers.filter(customer => 
          customer.phone.includes(searchPhone)
        )
      );
    } else {
      setSearchResults([]);
    }
  }, [searchPhone, customers]);

  // Handle add customer
  const handleAddCustomer = () => {
    if (!newName || !newPhone) {
      toast({
        title: "Error",
        description: "Name and phone number are required",
        variant: "destructive",
        duration: 1000,
      });
      return;
    }

    // Check if phone number already exists
    const existing = findCustomerByPhone(newPhone);
    if (existing) {
      toast({
        title: "Error",
        description: "Customer with this phone number already exists",
        variant: "destructive",
        duration: 1000,
      });
      return;
    }

    try {
      const customer = addCustomer({
        name: newName,
        phone: newPhone,
      });
      
      setCurrentCustomer(customer);
      
      toast({
        title: "Customer Added",
        description: `${newName} has been added to your customers`,
        duration: 1000,
      });
      
      setIsAddDialogOpen(false);
      setNewName('');
      setNewPhone('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add customer",
        variant: "destructive",
        duration: 1000,
      });
    }
  };

  // Handle select customer
  const handleSelectCustomer = (customer) => {
    setCurrentCustomer(customer);
    setIsSearchDialogOpen(false);
    setSearchPhone('');
    
    toast({
      title: "Customer Selected",
      description: `${customer.name} has been selected`,
      duration: 1000,
    });
  };

  // Handle clear customer
  const handleClearCustomer = () => {
    setCurrentCustomer(null);
    
    toast({
      title: "Customer Cleared",
      description: "No customer associated with this order",
      duration: 1000,
    });
  };

  return (
    <div>
      {currentCustomer ? (
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <h3 className="font-medium">{currentCustomer.name}</h3>
            </div>
            <p className="text-sm text-gray-500">{currentCustomer.phone}</p>
            <div className="flex items-center mt-1 text-sm">
              <Star className="h-3 w-3 text-yellow-500 mr-1" />
              <span>{currentCustomer.loyaltyPoints} points</span>
              <span className="mx-2">•</span>
              <span>Visits: {currentCustomer.visitCount}</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClearCustomer}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Dialog open={isSearchDialogOpen} onOpenChange={setIsSearchDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1">
                <User className="mr-2 h-4 w-4" />
                Find Customer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Find Customer</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="phone-search">Phone Number</Label>
                  <Input 
                    id="phone-search" 
                    placeholder="Enter phone number" 
                    value={searchPhone}
                    onChange={(e) => setSearchPhone(e.target.value)}
                  />
                </div>
                
                {searchResults.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    <Label>Search Results</Label>
                    {searchResults.map((customer) => (
                      <div 
                        key={customer.id} 
                        className="p-2 border rounded cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSelectCustomer(customer)}
                      >
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-gray-500">{customer.phone}</div>
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <Star className="h-3 w-3 text-yellow-500 mr-1" />
                          <span>{customer.loyaltyPoints} points</span>
                          <span className="mx-1">•</span>
                          <span>Last visit: {format(new Date(customer.lastVisit), 'MMM dd, yyyy')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchPhone.length >= 3 ? (
                  <p className="text-center py-2 text-gray-500">No customers found</p>
                ) : null}
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default" className="flex-1">
                <UserPlus className="mr-2 h-4 w-4" />
                New Customer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="customer-name">Name</Label>
                  <Input 
                    id="customer-name" 
                    placeholder="Enter name" 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customer-phone">Phone Number</Label>
                  <Input 
                    id="customer-phone" 
                    placeholder="Enter phone number" 
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddCustomer}>
                  Add Customer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
};

export default CustomerSelector;
