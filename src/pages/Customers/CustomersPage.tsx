
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useCustomer } from '@/contexts/CustomerContext';
import { Search, Plus, User, Phone, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

const CustomersPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState<any[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { customers, addCustomer } = useCustomer();
  const { toast } = useToast();

  // Filter customers based on search
  useEffect(() => {
    if (searchQuery) {
      setFilteredCustomers(
        customers.filter(
          (customer) =>
            customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            customer.phone.includes(searchQuery)
        )
      );
    } else {
      setFilteredCustomers(customers);
    }
  }, [customers, searchQuery]);

  const handleAddCustomer = async () => {
    if (!newName || !newPhone) {
      toast({
        title: "Error",
        description: "Name and phone number are required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Check if phone already exists
      const { data, error } = await supabase
        .from('customers')
        .select('id')
        .eq('phone', newPhone)
        .single();
        
      if (data) {
        toast({
          title: "Error",
          description: "A customer with this phone number already exists",
          variant: "destructive",
        });
        return;
      }
      
      const newCustomer = addCustomer({
        name: newName,
        phone: newPhone,
      });
      
      toast({
        title: "Customer Added",
        description: `${newName} has been added successfully`,
      });
      
      setIsAddDialogOpen(false);
      setNewName('');
      setNewPhone('');
    } catch (error) {
      console.error('Error adding customer:', error);
      toast({
        title: "Error",
        description: "Failed to add customer",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout title="Customers" showBackButton>
      <div className="mir-container">
        <div className="flex justify-between items-center mb-4">
          <div className="relative flex-1 mr-2">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name or phone"
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            className="bg-mir-yellow text-mir-black hover:bg-mir-yellow/90"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>

        {filteredCustomers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No customers found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCustomers.map((customer) => (
              <Card key={customer.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1 text-mir-gray-dark" />
                        <h3 className="font-semibold text-mir-black">{customer.name}</h3>
                      </div>
                      <div className="flex items-center mt-1">
                        <Phone className="h-4 w-4 mr-1 text-mir-gray-dark" />
                        <p className="text-sm">{customer.phone}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end">
                        <Star className="h-4 w-4 mr-1 text-mir-yellow" />
                        <p className="font-bold">{customer.loyaltyPoints} points</p>
                      </div>
                      <p className="text-xs text-mir-gray-dark mt-1">
                        {customer.visitCount} visits
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-3 text-xs text-mir-gray-dark">
                    <p>Last visit: {formatDistanceToNow(new Date(customer.lastVisit), { addSuffix: true })}</p>
                    <p>Customer since: {formatDistanceToNow(new Date(customer.firstVisit), { addSuffix: true })}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Customer Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="customer-name">Name</Label>
              <Input 
                id="customer-name" 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter customer name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="customer-phone">Phone Number</Label>
              <Input 
                id="customer-phone" 
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="Enter phone number"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddCustomer}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Customer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default CustomersPage;
